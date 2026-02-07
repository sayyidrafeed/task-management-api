import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { Hono } from 'hono';
import { TaskService } from '../../src/business/services/TaskService';
import { TaskController } from '../../src/presentation/controllers/TaskController';
import { createTaskRoutes } from '../../src/presentation/routes/taskRoutes';
import { errorHandler } from '../../src/presentation/middleware/errorHandler';
import { MockTaskRepository } from '../mocks/MockTaskRepository';

// Valid UUID that doesn't exist in database (for 404 testing)
const NON_EXISTENT_UUID = '550e8400-e29b-41d4-a716-446655440000';

describe('Task API Integration Tests', () => {
  let app: Hono;
  let mockRepository: MockTaskRepository;

  beforeAll(() => {
    // Setup with mock repository for integration tests
    mockRepository = new MockTaskRepository();
    const taskService = new TaskService(mockRepository);
    const taskController = new TaskController(taskService);
    const taskRoutes = createTaskRoutes(taskController);

    app = new Hono();
    app.route('/api', taskRoutes);
    app.onError(errorHandler);
  });

  afterAll(() => {
    mockRepository.reset();
  });

  describe('POST /api/tasks', () => {
    it('should create a task', async () => {
      const response = await app.fetch(new Request('http://localhost/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Integration Test Task',
          description: 'Test Description',
          priority: 'HIGH'
        })
      }));

      expect(response.status).toBe(201);
      
      const data = await response.json();
      expect(data.title).toBe('Integration Test Task');
      expect(data.description).toBe('Test Description');
      expect(data.priority).toBe('HIGH');
      expect(data.status).toBe('TODO');
      expect(data.id).toBeDefined();
    });

    it('should reject invalid request body', async () => {
      const response = await app.fetch(new Request('http://localhost/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '', // Empty title
          priority: 'INVALID'
        })
      }));

      expect(response.status).toBe(400);
    });

    it('should reject request with missing title', async () => {
      const response = await app.fetch(new Request('http://localhost/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: 'No title provided'
        })
      }));

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/tasks', () => {
    it('should list all tasks', async () => {
      // Create some test tasks
      await mockRepository.create({ title: 'Task 1', priority: 'LOW' });
      await mockRepository.create({ title: 'Task 2', priority: 'HIGH' });

      const response = await app.fetch(new Request('http://localhost/api/tasks'));

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(Array.isArray(data.tasks)).toBe(true);
      expect(data.tasks.length).toBeGreaterThanOrEqual(2);
      expect(data.total).toBeDefined();
      expect(data.page).toBe(1);
    });

    it('should filter tasks by status', async () => {
      const task = await mockRepository.create({ title: 'In Progress Task' });
      await mockRepository.update(task.id, { status: 'IN_PROGRESS' });

      const response = await app.fetch(
        new Request('http://localhost/api/tasks?status=IN_PROGRESS')
      );

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.tasks.every((t: { status: string }) => t.status === 'IN_PROGRESS')).toBe(true);
    });

    it('should filter tasks by priority', async () => {
      await mockRepository.create({ title: 'High Priority', priority: 'HIGH' });
      await mockRepository.create({ title: 'Low Priority', priority: 'LOW' });

      const response = await app.fetch(
        new Request('http://localhost/api/tasks?priority=HIGH')
      );

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.tasks.every((t: { priority: string }) => t.priority === 'HIGH')).toBe(true);
    });

    it('should paginate results', async () => {
      // Create multiple tasks
      for (let i = 0; i < 15; i++) {
        await mockRepository.create({ title: `Task ${i}` });
      }

      const response = await app.fetch(
        new Request('http://localhost/api/tasks?page=1&pageSize=5')
      );

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.tasks.length).toBeLessThanOrEqual(5);
      expect(data.page).toBe(1);
      expect(data.pageSize).toBe(5);
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should get task by ID', async () => {
      const created = await mockRepository.create({ title: 'Find Me' });

      const response = await app.fetch(
        new Request(`http://localhost/api/tasks/${created.id}`)
      );

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.title).toBe('Find Me');
    });

    it('should return 404 for non-existent task', async () => {
      const response = await app.fetch(
        new Request(`http://localhost/api/tasks/${NON_EXISTENT_UUID}`)
      );

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update task', async () => {
      const created = await mockRepository.create({ title: 'Original Title' });

      const response = await app.fetch(
        new Request(`http://localhost/api/tasks/${created.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Updated Title',
            description: 'Updated Description'
          })
        })
      );

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.title).toBe('Updated Title');
      expect(data.description).toBe('Updated Description');
    });

    it('should return 404 for non-existent task', async () => {
      const response = await app.fetch(
        new Request(`http://localhost/api/tasks/${NON_EXISTENT_UUID}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'New Title' })
        })
      );

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /api/tasks/:id/status', () => {
    it('should update task status', async () => {
      const created = await mockRepository.create({ title: 'Status Test' });

      const response = await app.fetch(
        new Request(`http://localhost/api/tasks/${created.id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'IN_PROGRESS' })
        })
      );

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.status).toBe('IN_PROGRESS');
    });

    it('should reject invalid status transition', async () => {
      const created = await mockRepository.create({ title: 'Status Test' });

      const response = await app.fetch(
        new Request(`http://localhost/api/tasks/${created.id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'DONE' }) // Can't go from TODO to DONE directly
        })
      );

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete task', async () => {
      const created = await mockRepository.create({ title: 'Delete Me' });

      const response = await app.fetch(
        new Request(`http://localhost/api/tasks/${created.id}`, {
          method: 'DELETE'
        })
      );

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.message).toBe('Task deleted successfully');

      // Verify task is deleted
      const getResponse = await app.fetch(
        new Request(`http://localhost/api/tasks/${created.id}`)
      );
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for non-existent task', async () => {
      const response = await app.fetch(
        new Request(`http://localhost/api/tasks/${NON_EXISTENT_UUID}`, {
          method: 'DELETE'
        })
      );

      expect(response.status).toBe(404);
    });
  });
});
