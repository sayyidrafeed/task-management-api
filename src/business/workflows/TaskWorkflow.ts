import { type TaskStatus } from '../../common/types/Task';
import { TaskStatusEnum } from '../../common/types/enums';
import { calculateOverdue } from '../../common/utils/dateUtils';

/**
 * Task Workflow
 * Handles business workflow rules and status transitions
 */
export class TaskWorkflow {
  /**
   * Check if a status transition is valid
   * Returns true if the transition is allowed
   */
  static canTransition(from: TaskStatus, to: TaskStatus): boolean {
    const workflow: Record<TaskStatusEnum, TaskStatusEnum[]> = {
      [TaskStatusEnum.TODO]: [TaskStatusEnum.IN_PROGRESS],
      [TaskStatusEnum.IN_PROGRESS]: [TaskStatusEnum.TODO, TaskStatusEnum.DONE],
      [TaskStatusEnum.DONE]: []
    };

    const allowedTransitions = workflow[from as TaskStatusEnum];
    return allowedTransitions?.includes(to as TaskStatusEnum) ?? false;
  }

  /**
   * Get all valid next statuses from a given status
   */
  static getValidNextStatuses(status: TaskStatus): TaskStatus[] {
    const workflow: Record<TaskStatusEnum, TaskStatusEnum[]> = {
      [TaskStatusEnum.TODO]: [TaskStatusEnum.IN_PROGRESS],
      [TaskStatusEnum.IN_PROGRESS]: [TaskStatusEnum.TODO, TaskStatusEnum.DONE],
      [TaskStatusEnum.DONE]: []
    };

    return workflow[status as TaskStatusEnum] || [];
  }

  /**
   * Check if a task is overdue
   * Business rule: Task is overdue if due date is before end of today
   */
  static checkOverdue(dueDate: Date | null | undefined): boolean {
    if (!dueDate) {
      return false;
    }
    return calculateOverdue(dueDate);
  }

  /**
   * Determine if a task should be auto-marked as overdue
   * Only pending and in-progress tasks can be overdue
   */
  static shouldMarkAsOverdue(
    status: TaskStatus,
    dueDate: Date | null | undefined
  ): boolean {
    // Only incomplete tasks can be overdue
    if (status === TaskStatusEnum.DONE) {
      return false;
    }

    return this.checkOverdue(dueDate);
  }

  /**
   * Get workflow explanation for a status
   */
  static getWorkflowExplanation(status: TaskStatus): string {
    const explanations: Record<TaskStatusEnum, string> = {
      [TaskStatusEnum.TODO]: 'Task is pending. Can be started (move to In Progress).',
      [TaskStatusEnum.IN_PROGRESS]: 'Task is being worked on. Can be moved back to Todo or marked as Done.',
      [TaskStatusEnum.DONE]: 'Task is completed. No further transitions allowed.'
    };

    return explanations[status as TaskStatusEnum] || 'Unknown status';
  }
}
