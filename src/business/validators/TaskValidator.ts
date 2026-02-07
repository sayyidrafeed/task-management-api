import type { TaskStatus, TaskPriority } from '../../common/types/Task';
import { TaskStatusEnum, TaskPriorityEnum, isValidTaskStatus, isValidTaskPriority } from '../../common/types/enums';
import { TASK_CONSTRAINTS } from '../../common/constants/taskConstants';
import { isDateInFuture } from '../../common/utils/dateUtils';

/**
 * Validation Error
 * Custom error class for business validation failures
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Task Validator
 * Handles all business validation rules for tasks
 * These are business rules, not input validation (which happens in presentation layer)
 */
export class TaskValidator {
  /**
   * Validate task title
   * Rules: Required, min 1 char, max 200 chars
   */
  static validateTitle(title: string): void {
    if (!title || title.trim().length === 0) {
      throw new ValidationError('Title is required');
    }

    if (title.trim().length < TASK_CONSTRAINTS.TITLE_MIN_LENGTH) {
      throw new ValidationError('Title must be at least 1 character');
    }

    if (title.length > TASK_CONSTRAINTS.TITLE_MAX_LENGTH) {
      throw new ValidationError(`Title must not exceed ${TASK_CONSTRAINTS.TITLE_MAX_LENGTH} characters`);
    }
  }

  /**
   * Validate task description
   * Rules: Optional, max 2000 chars
   */
  static validateDescription(description?: string): void {
    if (description !== undefined && description.length > TASK_CONSTRAINTS.DESCRIPTION_MAX_LENGTH) {
      throw new ValidationError(`Description must not exceed ${TASK_CONSTRAINTS.DESCRIPTION_MAX_LENGTH} characters`);
    }
  }

  /**
   * Validate due date
   * Rules: Must be in the future (if provided)
   */
  static validateDueDate(dueDate: Date): void {
    if (!isDateInFuture(dueDate)) {
      throw new ValidationError('Due date must be in the future');
    }
  }

  /**
   * Validate status value
   * Rules: Must be a valid TaskStatus enum value
   */
  static validateStatus(status: string): asserts status is TaskStatus {
    if (!isValidTaskStatus(status)) {
      throw new ValidationError(`Invalid status: ${status}. Valid values are: ${Object.values(TaskStatusEnum).join(', ')}`);
    }
  }

  /**
   * Validate priority value
   * Rules: Must be a valid TaskPriority enum value
   */
  static validatePriority(priority: string): asserts priority is TaskPriority {
    if (!isValidTaskPriority(priority)) {
      throw new ValidationError(`Invalid priority: ${priority}. Valid values are: ${Object.values(TaskPriorityEnum).join(', ')}`);
    }
  }

  /**
   * Validate status transition
   * Rules: Must follow the workflow defined in TASK_STATUS_FLOW
   */
  static validateStatusTransition(
    currentStatus: TaskStatus,
    newStatus: TaskStatus
  ): void {
    const allowedTransitions = TaskStatusEnum[currentStatus];
    
    // Get allowed next statuses from workflow
    const workflow = {
      [TaskStatusEnum.TODO]: [TaskStatusEnum.IN_PROGRESS],
      [TaskStatusEnum.IN_PROGRESS]: [TaskStatusEnum.TODO, TaskStatusEnum.DONE],
      [TaskStatusEnum.DONE]: []
    };

    const allowedNextStatuses = workflow[currentStatus];
    
    if (!allowedNextStatuses.includes(newStatus as TaskStatusEnum)) {
      throw new ValidationError(
        `Invalid status transition from "${currentStatus}" to "${newStatus}". ` +
        `Allowed transitions: ${allowedNextStatuses.length > 0 ? allowedNextStatuses.join(', ') : 'none'}`
      );
    }
  }

  /**
   * Validate complete task creation data
   */
  static validateCreateTask(data: {
    title: string;
    description?: string;
    priority?: TaskPriority;
    dueDate?: Date;
  }): void {
    this.validateTitle(data.title);
    
    if (data.description !== undefined) {
      this.validateDescription(data.description);
    }
    
    if (data.priority !== undefined) {
      this.validatePriority(data.priority);
    }
    
    if (data.dueDate !== undefined) {
      this.validateDueDate(data.dueDate);
    }
  }

  /**
   * Validate complete task update data
   */
  static validateUpdateTask(data: {
    title?: string;
    description?: string;
    priority?: TaskPriority;
    dueDate?: Date;
    status?: TaskStatus;
  }): void {
    if (data.title !== undefined) {
      this.validateTitle(data.title);
    }
    
    if (data.description !== undefined) {
      this.validateDescription(data.description);
    }
    
    if (data.priority !== undefined) {
      this.validatePriority(data.priority);
    }
    
    if (data.dueDate !== undefined) {
      this.validateDueDate(data.dueDate);
    }
    
    if (data.status !== undefined) {
      this.validateStatus(data.status);
    }
  }
}
