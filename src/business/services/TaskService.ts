import type { ITaskRepository } from '../../data/repositories/TaskRepository';
import type { TaskFilters, CreateTaskData, UpdateTaskData, Task } from '../../common/types/Task';
import type { TaskStatus } from '../../common/types/Task';
import { TaskValidator, ValidationError } from '../validators/TaskValidator';
import { TaskWorkflow } from '../workflows/TaskWorkflow';
import { DEFAULT_PAGE_SIZE } from '../../common/constants/taskConstants';

/**
 * Task Not Found Error
 */
export class TaskNotFoundError extends Error {
  constructor(id: string) {
    super(`Task with id "${id}" not found`);
    this.name = 'TaskNotFoundError';
  }
}

/**
 * Task Service
 * Core business logic for task operations
 * Orchestrates between validators, workflows, and repository
 */
export class TaskService {
  constructor(private readonly taskRepository: ITaskRepository) {}

  /**
   * Create a new task
   * Validates business rules and persists to database
   */
  async createTask(data: CreateTaskData): Promise<Task> {
    // Validate business rules
    TaskValidator.validateCreateTask(data);

    // Create task in repository
    const task = await this.taskRepository.create(data);

    return this.toTaskDTO(task);
  }

  /**
   * Get a single task by ID
   */
  async getTaskById(id: string): Promise<Task | null> {
    const task = await this.taskRepository.findById(id);
    
    if (!task) {
      return null;
    }

    return this.toTaskDTO(task);
  }

  /**
   * Get task by ID or throw error
   */
  async getTaskByIdOrThrow(id: string): Promise<Task> {
    const task = await this.getTaskById(id);
    
    if (!task) {
      throw new TaskNotFoundError(id);
    }

    return task;
  }

  /**
   * Get tasks with filtering and pagination
   */
  async getTasks(filters?: TaskFilters): Promise<{
    tasks: Task[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || DEFAULT_PAGE_SIZE;

    // Fetch tasks from repository
    const tasks = await this.taskRepository.findAll(filters);
    const total = await this.taskRepository.count(filters);

    // Check overdue status for each task
    const tasksWithOverdueCheck = tasks.map(task => {
      const shouldBeOverdue = TaskWorkflow.shouldMarkAsOverdue(
        task.status,
        task.dueDate
      );

      // Update overdue flag if needed
      if (shouldBeOverdue !== task.isOverdue) {
        task.setOverdue(shouldBeOverdue);
        // Note: In a real app, you might want to persist this change
        // await this.taskRepository.update(task.id, { isOverdue: shouldBeOverdue });
      }

      return this.toTaskDTO(task);
    });

    return {
      tasks: tasksWithOverdueCheck,
      total,
      page,
      pageSize
    };
  }

  /**
   * Update task details
   */
  async updateTask(id: string, data: UpdateTaskData): Promise<Task> {
    // Validate business rules
    TaskValidator.validateUpdateTask(data);

    // Check if task exists
    const existingTask = await this.taskRepository.findById(id);
    if (!existingTask) {
      throw new TaskNotFoundError(id);
    }

    // If due date is being updated, validate it
    if (data.dueDate !== undefined) {
      TaskValidator.validateDueDate(data.dueDate);
    }

    // Update task
    const updatedTask = await this.taskRepository.update(id, data);
    
    if (!updatedTask) {
      throw new TaskNotFoundError(id);
    }

    return this.toTaskDTO(updatedTask);
  }

  /**
   * Update task status with workflow validation
   */
  async updateTaskStatus(id: string, newStatus: TaskStatus): Promise<Task> {
    // Validate status value
    TaskValidator.validateStatus(newStatus);

    // Get existing task
    const existingTask = await this.taskRepository.findById(id);
    if (!existingTask) {
      throw new TaskNotFoundError(id);
    }

    // Validate status transition
    TaskValidator.validateStatusTransition(existingTask.status, newStatus);

    // Update status
    const updatedTask = await this.taskRepository.update(id, { status: newStatus });
    
    if (!updatedTask) {
      throw new TaskNotFoundError(id);
    }

    return this.toTaskDTO(updatedTask);
  }

  /**
   * Soft delete a task
   */
  async deleteTask(id: string): Promise<void> {
    const deleted = await this.taskRepository.softDelete(id);
    
    if (!deleted) {
      throw new TaskNotFoundError(id);
    }
  }

  /**
   * Convert TaskModel to Task DTO
   */
  private toTaskDTO(task: { 
    id: string; 
    title: string; 
    description?: string; 
    status: TaskStatus; 
    priority: import('../../common/types/Task').TaskPriority; 
    dueDate?: Date; 
    isOverdue: boolean; 
    createdAt: Date; 
    updatedAt: Date; 
  }): Task {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      isOverdue: task.isOverdue,
      isDeleted: false, // Soft deleted tasks are not returned
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    };
  }
}
