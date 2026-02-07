import type { PrismaClient } from '@prisma/client';
import type { TaskFilters, CreateTaskData, UpdateTaskData } from '../../common/types/Task';
import { TaskModel } from '../models/TaskModel';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../common/constants/taskConstants';

/**
 * Task Repository Interface
 * Defines the contract for task data access
 */
export interface ITaskRepository {
  findById(id: string): Promise<TaskModel | null>;
  findAll(filters?: TaskFilters): Promise<TaskModel[]>;
  create(data: CreateTaskData): Promise<TaskModel>;
  update(id: string, data: UpdateTaskData): Promise<TaskModel | null>;
  softDelete(id: string): Promise<boolean>;
  count(filters?: Omit<TaskFilters, 'page' | 'pageSize'>): Promise<number>;
}

/**
 * Task Repository Implementation
 * Handles all database operations for tasks using Prisma
 */
export class TaskRepository implements ITaskRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Find a task by its ID
   */
  async findById(id: string): Promise<TaskModel | null> {
    const prismaTask = await this.prisma.task.findUnique({
      where: {
        id,
        isDeleted: false
      }
    });

    if (!prismaTask) {
      return null;
    }

    return TaskModel.fromPrisma(prismaTask);
  }

  /**
   * Find all tasks with optional filtering
   */
  async findAll(filters?: TaskFilters): Promise<TaskModel[]> {
    const page = filters?.page || 1;
    const pageSize = Math.min(
      filters?.pageSize || DEFAULT_PAGE_SIZE,
      MAX_PAGE_SIZE
    );
    const skip = (page - 1) * pageSize;

    const prismaTasks = await this.prisma.task.findMany({
      where: this.buildWhereClause(filters),
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      skip,
      take: pageSize
    });

    return prismaTasks.map(TaskModel.fromPrisma);
  }

  /**
   * Count tasks matching filters
   */
  async count(filters?: Omit<TaskFilters, 'page' | 'pageSize'>): Promise<number> {
    return await this.prisma.task.count({
      where: this.buildWhereClause(filters)
    });
  }

  /**
   * Create a new task
   */
  async create(data: CreateTaskData): Promise<TaskModel> {
    const taskModel = new TaskModel({
      title: data.title,
      description: data.description,
      priority: data.priority,
      dueDate: data.dueDate
    });

    const prismaTask = await this.prisma.task.create({
      data: taskModel.toPrismaCreateInput()
    });

    return TaskModel.fromPrisma(prismaTask);
  }

  /**
   * Update an existing task
   */
  async update(id: string, data: UpdateTaskData): Promise<TaskModel | null> {
    // Check if task exists and is not deleted
    const existingTask = await this.findById(id);
    if (!existingTask) {
      return null;
    }

    // Apply updates to the model
    if (data.title !== undefined) existingTask.title = data.title;
    if (data.description !== undefined) existingTask.description = data.description;
    if (data.priority !== undefined) existingTask.priority = data.priority;
    if (data.dueDate !== undefined) existingTask.dueDate = data.dueDate;
    if (data.status !== undefined) existingTask.status = data.status;
    if (data.isOverdue !== undefined) existingTask.isOverdue = data.isOverdue;
    
    existingTask.updatedAt = new Date();

    const prismaTask = await this.prisma.task.update({
      where: { id },
      data: existingTask.toPrismaUpdateInput()
    });

    return TaskModel.fromPrisma(prismaTask);
  }

  /**
   * Soft delete a task
   */
  async softDelete(id: string): Promise<boolean> {
    const existingTask = await this.findById(id);
    if (!existingTask) {
      return false;
    }

    await this.prisma.task.update({
      where: { id },
      data: {
        isDeleted: true,
        updatedAt: new Date()
      }
    });

    return true;
  }

  /**
   * Build Prisma where clause from filters
   */
  private buildWhereClause(filters?: TaskFilters): {
    isDeleted: boolean;
    status?: string;
    priority?: string;
    isOverdue?: boolean;
  } {
    const where: ReturnType<TaskRepository['buildWhereClause']> = {
      isDeleted: false
    };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.priority) {
      where.priority = filters.priority;
    }

    if (filters?.isOverdue !== undefined) {
      where.isOverdue = filters.isOverdue;
    }

    return where;
  }
}
