import type { ITaskRepository } from '../../src/data/repositories/TaskRepository';
import { TaskModel } from '../../src/data/models/TaskModel';
import type { TaskFilters, CreateTaskData, UpdateTaskData, TaskStatus, TaskPriority } from '../../src/common/types/Task';

/**
 * Mock Task Repository
 * In-memory implementation for unit testing
 * Follows the same interface as TaskRepository
 */
export class MockTaskRepository implements ITaskRepository {
  private tasks: TaskModel[] = [];
  private idCounter = 1;

  /**
   * Reset the mock repository
   */
  reset(): void {
    this.tasks = [];
    this.idCounter = 1;
  }

  /**
   * Find task by ID
   */
  async findById(id: string): Promise<TaskModel | null> {
    const task = this.tasks.find(t => t.id === id && !t.isDeleted);
    return task || null;
  }

  /**
   * Find all tasks with filters
   */
  async findAll(filters?: TaskFilters): Promise<TaskModel[]> {
    let results = this.tasks.filter(t => !t.isDeleted);

    if (filters?.status) {
      results = results.filter(t => t.status === filters.status);
    }

    if (filters?.priority) {
      results = results.filter(t => t.priority === filters.priority);
    }

    if (filters?.isOverdue !== undefined) {
      results = results.filter(t => t.isOverdue === filters.isOverdue);
    }

    // Apply pagination
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 20;
    const skip = (page - 1) * pageSize;

    return results.slice(skip, skip + pageSize);
  }

  /**
   * Count tasks matching filters
   */
  async count(filters?: Omit<TaskFilters, 'page' | 'pageSize'>): Promise<number> {
    let results = this.tasks.filter(t => !t.isDeleted);

    if (filters?.status) {
      results = results.filter(t => t.status === filters.status);
    }

    if (filters?.priority) {
      results = results.filter(t => t.priority === filters.priority);
    }

    if (filters?.isOverdue !== undefined) {
      results = results.filter(t => t.isOverdue === filters.isOverdue);
    }

    return results.length;
  }

  /**
   * Generate a UUID v4
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Create a new task
   */
  async create(data: CreateTaskData): Promise<TaskModel> {
    const task = new TaskModel({
      id: this.generateUUID(),
      title: data.title,
      description: data.description,
      priority: data.priority,
      dueDate: data.dueDate,
      status: 'TODO',
      isOverdue: false,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    this.tasks.push(task);
    return task;
  }

  /**
   * Update an existing task
   */
  async update(id: string, data: UpdateTaskData): Promise<TaskModel | null> {
    const index = this.tasks.findIndex(t => t.id === id && !t.isDeleted);
    
    if (index === -1) {
      return null;
    }

    const existingTask = this.tasks[index];

    // Apply updates
    if (data.title !== undefined) existingTask.title = data.title;
    if (data.description !== undefined) existingTask.description = data.description;
    if (data.priority !== undefined) existingTask.priority = data.priority;
    if (data.dueDate !== undefined) existingTask.dueDate = data.dueDate;
    if (data.status !== undefined) existingTask.status = data.status;
    if (data.isOverdue !== undefined) existingTask.isOverdue = data.isOverdue;
    
    existingTask.updatedAt = new Date();

    return existingTask;
  }

  /**
   * Soft delete a task
   */
  async softDelete(id: string): Promise<boolean> {
    const task = this.tasks.find(t => t.id === id && !t.isDeleted);
    
    if (!task) {
      return false;
    }

    task.isDeleted = true;
    task.updatedAt = new Date();
    return true;
  }

  /**
   * Helper method to get all tasks (including deleted)
   */
  getAllTasks(): TaskModel[] {
    return [...this.tasks];
  }

  /**
   * Helper method to seed tasks for testing
   */
  seedTasks(tasks: Partial<TaskModel>[]): void {
    for (const taskData of tasks) {
      const task = new TaskModel({
        id: taskData.id || this.generateUUID(),
        title: taskData.title || 'Test Task',
        description: taskData.description,
        status: taskData.status || 'TODO',
        priority: taskData.priority || 'MEDIUM',
        dueDate: taskData.dueDate,
        isOverdue: taskData.isOverdue || false,
        isDeleted: taskData.isDeleted || false,
        createdAt: taskData.createdAt || new Date(),
        updatedAt: taskData.updatedAt || new Date()
      });
      this.tasks.push(task);
    }
  }
}
