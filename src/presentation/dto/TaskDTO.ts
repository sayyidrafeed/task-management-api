import type { TaskStatus, TaskPriority } from '../../common/types/Task';

/**
 * Create Task Request DTO
 * Expected body when creating a new task
 */
export interface CreateTaskRequestDTO {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string; // ISO date string
}

/**
 * Update Task Request DTO
 * Expected body when updating a task
 */
export interface UpdateTaskRequestDTO {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string; // ISO date string
}

/**
 * Update Task Status Request DTO
 * Expected body when updating task status
 */
export interface UpdateTaskStatusRequestDTO {
  status: TaskStatus;
}

/**
 * Task Response DTO
 * Returned in API responses
 */
export interface TaskResponseDTO {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string; // ISO date string
  isOverdue: boolean;
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
}

/**
 * Task List Response DTO
 * Returned when listing tasks
 */
export interface TaskListResponseDTO {
  tasks: TaskResponseDTO[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Error Response DTO
 * Returned when an error occurs
 */
export interface ErrorResponseDTO {
  error: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

/**
 * Success Message DTO
 * Returned for simple success responses
 */
export interface SuccessMessageDTO {
  message: string;
}
