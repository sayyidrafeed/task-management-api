import type { Task as TaskType, TaskStatus, TaskPriority, CreateTaskData, UpdateTaskData } from '../../common/types/Task';
import { TaskStatusEnum, TaskPriorityEnum } from '../../common/types/enums';

/**
 * Task Model
 * Domain model representing a Task entity
 * Implements the Task interface from common types
 */
export class TaskModel implements TaskType {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  isOverdue: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<TaskType> & { title: string }) {
    this.id = data.id || crypto.randomUUID();
    this.title = data.title;
    this.description = data.description;
    this.status = data.status || TaskStatusEnum.TODO;
    this.priority = data.priority || TaskPriorityEnum.MEDIUM;
    this.dueDate = data.dueDate;
    this.isOverdue = data.isOverdue || false;
    this.isDeleted = data.isDeleted || false;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Convert Prisma Task to TaskModel
   */
  static fromPrisma(prismaTask: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    dueDate: Date | null;
    isOverdue: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): TaskModel {
    return new TaskModel({
      id: prismaTask.id,
      title: prismaTask.title,
      description: prismaTask.description || undefined,
      status: prismaTask.status as TaskStatus,
      priority: prismaTask.priority as TaskPriority,
      dueDate: prismaTask.dueDate || undefined,
      isOverdue: prismaTask.isOverdue,
      isDeleted: prismaTask.isDeleted,
      createdAt: prismaTask.createdAt,
      updatedAt: prismaTask.updatedAt
    });
  }

  /**
   * Convert to Prisma create input
   */
  toPrismaCreateInput(): {
    title: string;
    description?: string;
    status: string;
    priority: string;
    dueDate?: Date;
    isOverdue: boolean;
  } {
    return {
      title: this.title,
      description: this.description,
      status: this.status,
      priority: this.priority,
      dueDate: this.dueDate,
      isOverdue: this.isOverdue
    };
  }

  /**
   * Convert to Prisma update input
   */
  toPrismaUpdateInput(): {
    title?: string;
    description?: string | null;
    status?: string;
    priority?: string;
    dueDate?: Date | null;
    isOverdue?: boolean;
    isDeleted?: boolean;
  } {
    const updateData: ReturnType<TaskModel['toPrismaUpdateInput']> = {};
    
    if (this.title !== undefined) updateData.title = this.title;
    if (this.description !== undefined) updateData.description = this.description ?? null;
    if (this.status !== undefined) updateData.status = this.status;
    if (this.priority !== undefined) updateData.priority = this.priority;
    if (this.dueDate !== undefined) updateData.dueDate = this.dueDate ?? null;
    if (this.isOverdue !== undefined) updateData.isOverdue = this.isOverdue;
    if (this.isDeleted !== undefined) updateData.isDeleted = this.isDeleted;
    
    return updateData;
  }

  /**
   * Mark task as deleted (soft delete)
   */
  markAsDeleted(): void {
    this.isDeleted = true;
    this.updatedAt = new Date();
  }

  /**
   * Update task status
   */
  updateStatus(newStatus: TaskStatus): void {
    this.status = newStatus;
    this.updatedAt = new Date();
  }

  /**
   * Update overdue flag
   */
  setOverdue(isOverdue: boolean): void {
    this.isOverdue = isOverdue;
    this.updatedAt = new Date();
  }
}
