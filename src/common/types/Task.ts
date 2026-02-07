/**
 * Task Status Types
 * Represents the workflow state of a task
 */
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

/**
 * Task Priority Types
 * Represents the priority level of a task
 */
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

/**
 * Core Task Interface
 * Domain model representing a task in the system
 */
export interface Task {
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
}

/**
 * Task Filters Interface
 * Used for querying tasks with filters
 */
export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  isOverdue?: boolean;
  page?: number;
  pageSize?: number;
}

/**
 * Create Task Data Interface
 * Used when creating a new task
 */
export interface CreateTaskData {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: Date;
}

/**
 * Update Task Data Interface
 * Used when updating an existing task
 */
export interface UpdateTaskData {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: Date;
  status?: TaskStatus;
  isOverdue?: boolean;
}
