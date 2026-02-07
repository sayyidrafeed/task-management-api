/**
 * Task Status Enum
 * Used for type-safe status comparisons and database storage
 */
export enum TaskStatusEnum {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE'
}

/**
 * Task Priority Enum
 * Used for type-safe priority comparisons and database storage
 */
export enum TaskPriorityEnum {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

/**
 * Check if a value is a valid TaskStatus
 */
export function isValidTaskStatus(status: string): status is TaskStatusEnum {
  return Object.values(TaskStatusEnum).includes(status as TaskStatusEnum);
}

/**
 * Check if a value is a valid TaskPriority
 */
export function isValidTaskPriority(priority: string): priority is TaskPriorityEnum {
  return Object.values(TaskPriorityEnum).includes(priority as TaskPriorityEnum);
}
