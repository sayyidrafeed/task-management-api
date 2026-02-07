import { describe, it, expect, beforeEach } from 'bun:test';
import { TaskService, TaskNotFoundError } from '../../../src/business/services/TaskService';
import { MockTaskRepository } from '../../mocks/MockTaskRepository';
import { ValidationError } from '../../../src/business/validators/TaskValidator';
import { TaskPriorityEnum, TaskStatusEnum } from '../../../src/common/types/enums';

describe('TaskService', () => {
  let taskService: TaskService;
  let mockRepository: MockTaskRepository;

  beforeEach(() => {
    mockRepository = new MockTaskRepository();
    taskService = new TaskService(mockRepository);
  });

  describe('createTask', () => {
    it('should create a task with valid data', async () => {
      const result = await taskService.createTask({
        title: 'Test Task',
        description: 'Test Description',
        priority: 'HIGH'
      });

      expect(result.title).toBe('Test Task');
      expect(result.description).toBe('Test Description');
      expect(result.priority).toBe('HIGH');
      expect(result.status).toBe('TODO');
      expect(result.id).toBeDefined();
    });

    it('should create a task with default priority', async () => {
      const result = await taskService.createTask({
        title: 'Test Task'
      });

      expect(result.priority).toBe('MEDIUM');
    });

    it('should reject task with empty title', async () => {
      expect(
        taskService.createTask({ title: '' })
      ).rejects.toThrow(ValidationError);
    });

    it('should reject task with title exceeding max length', async () => {
      const longTitle = 'a'.repeat(201);
      expect(
        taskService.createTask({ title: longTitle })
      ).rejects.toThrow(ValidationError);
    });

    it('should reject task with due date in the past', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      expect(
        taskService.createTask({
          title: 'Test Task',
          dueDate: pastDate
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should create task with future due date', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const result = await taskService.createTask({
        title: 'Test Task',
        dueDate: futureDate
      });

      expect(result.dueDate).toBeDefined();
    });
  });

  describe('getTaskById', () => {
    it('should return task when found', async () => {
      const created = await taskService.createTask({
        title: 'Test Task'
      });

      const result = await taskService.getTaskById(created.id);

      expect(result).not.toBeNull();
      expect(result?.title).toBe('Test Task');
    });

    it('should return null when task not found', async () => {
      const result = await taskService.getTaskById('non-existent-id');
      expect(result).toBeNull();
    });

    it('should not return soft-deleted tasks', async () => {
      const created = await taskService.createTask({
        title: 'Test Task'
      });

      await taskService.deleteTask(created.id);

      const result = await taskService.getTaskById(created.id);
      expect(result).toBeNull();
    });
  });

  describe('getTaskByIdOrThrow', () => {
    it('should return task when found', async () => {
      const created = await taskService.createTask({
        title: 'Test Task'
      });

      const result = await taskService.getTaskByIdOrThrow(created.id);
      expect(result.title).toBe('Test Task');
    });

    it('should throw TaskNotFoundError when task not found', async () => {
      expect(
        taskService.getTaskByIdOrThrow('non-existent-id')
      ).rejects.toThrow(TaskNotFoundError);
    });
  });

  describe('getTasks', () => {
    it('should return paginated tasks', async () => {
      // Create multiple tasks
      for (let i = 0; i < 25; i++) {
        await taskService.createTask({
          title: `Task ${i}`
        });
      }

      const result = await taskService.getTasks({ page: 1, pageSize: 10 });

      expect(result.tasks).toHaveLength(10);
      expect(result.total).toBe(25);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
    });

    it('should filter by status', async () => {
      const task1 = await taskService.createTask({ title: 'Task 1' });
      const task2 = await taskService.createTask({ title: 'Task 2' });
      
      // Move task2 to IN_PROGRESS
      await taskService.updateTaskStatus(task2.id, 'IN_PROGRESS');

      const result = await taskService.getTasks({ status: 'IN_PROGRESS' });

      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0].title).toBe('Task 2');
    });

    it('should filter by priority', async () => {
      await taskService.createTask({ title: 'Low Priority', priority: 'LOW' });
      await taskService.createTask({ title: 'High Priority', priority: 'HIGH' });

      const result = await taskService.getTasks({ priority: 'HIGH' });

      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0].title).toBe('High Priority');
    });
  });

  describe('updateTask', () => {
    it('should update task title', async () => {
      const created = await taskService.createTask({
        title: 'Original Title'
      });

      const updated = await taskService.updateTask(created.id, {
        title: 'Updated Title'
      });

      expect(updated.title).toBe('Updated Title');
    });

    it('should update task description', async () => {
      const created = await taskService.createTask({
        title: 'Test Task'
      });

      const updated = await taskService.updateTask(created.id, {
        description: 'New Description'
      });

      expect(updated.description).toBe('New Description');
    });

    it('should throw TaskNotFoundError for non-existent task', async () => {
      expect(
        taskService.updateTask('non-existent-id', { title: 'New Title' })
      ).rejects.toThrow(TaskNotFoundError);
    });

    it('should validate updated title', async () => {
      const created = await taskService.createTask({
        title: 'Test Task'
      });

      expect(
        taskService.updateTask(created.id, { title: '' })
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('updateTaskStatus', () => {
    it('should update status from TODO to IN_PROGRESS', async () => {
      const created = await taskService.createTask({
        title: 'Test Task'
      });

      const updated = await taskService.updateTaskStatus(created.id, 'IN_PROGRESS');

      expect(updated.status).toBe('IN_PROGRESS');
    });

    it('should update status from IN_PROGRESS to DONE', async () => {
      const created = await taskService.createTask({
        title: 'Test Task'
      });

      await taskService.updateTaskStatus(created.id, 'IN_PROGRESS');
      const updated = await taskService.updateTaskStatus(created.id, 'DONE');

      expect(updated.status).toBe('DONE');
    });

    it('should reject invalid status transition', async () => {
      const created = await taskService.createTask({
        title: 'Test Task'
      });

      // Cannot go from TODO directly to DONE
      expect(
        taskService.updateTaskStatus(created.id, 'DONE')
      ).rejects.toThrow(ValidationError);
    });

    it('should throw TaskNotFoundError for non-existent task', async () => {
      expect(
        taskService.updateTaskStatus('non-existent-id', 'IN_PROGRESS')
      ).rejects.toThrow(TaskNotFoundError);
    });
  });

  describe('deleteTask', () => {
    it('should soft delete task', async () => {
      const created = await taskService.createTask({
        title: 'Test Task'
      });

      await taskService.deleteTask(created.id);

      // Task should no longer be retrievable
      const result = await taskService.getTaskById(created.id);
      expect(result).toBeNull();
    });

    it('should throw TaskNotFoundError for non-existent task', async () => {
      expect(
        taskService.deleteTask('non-existent-id')
      ).rejects.toThrow(TaskNotFoundError);
    });

    it('should throw TaskNotFoundError for already deleted task', async () => {
      const created = await taskService.createTask({
        title: 'Test Task'
      });

      await taskService.deleteTask(created.id);

      expect(
        taskService.deleteTask(created.id)
      ).rejects.toThrow(TaskNotFoundError);
    });
  });
});
