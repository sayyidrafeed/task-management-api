import { TaskStatusEnum, TaskPriorityEnum } from '../types/enums';

/**
 * Task Status Workflow Configuration
 * Defines valid status transitions
 * TODO → IN_PROGRESS → DONE
 */
export const TASK_STATUS_FLOW: Record<TaskStatusEnum, TaskStatusEnum[]> = {
  [TaskStatusEnum.TODO]: [TaskStatusEnum.IN_PROGRESS],
  [TaskStatusEnum.IN_PROGRESS]: [TaskStatusEnum.TODO, TaskStatusEnum.DONE],
  [TaskStatusEnum.DONE]: []
};

/**
 * Default pagination settings
 */
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/**
 * Task validation constraints
 */
export const TASK_CONSTRAINTS = {
  TITLE_MIN_LENGTH: 1,
  TITLE_MAX_LENGTH: 200,
  DESCRIPTION_MAX_LENGTH: 2000
} as const;

/**
 * Default values for new tasks
 */
export const TASK_DEFAULTS = {
  STATUS: TaskStatusEnum.TODO,
  PRIORITY: TaskPriorityEnum.MEDIUM
} as const;

/**
 * API route constants
 */
export const API_ROUTES = {
  TASKS: '/api/tasks',
  TASK_BY_ID: '/api/tasks/:id',
  TASK_STATUS: '/api/tasks/:id/status'
} as const;

/**
 * HTTP Status codes used in the application
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500
} as const;
