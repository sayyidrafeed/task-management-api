/**
 * Date Utility Functions
 * Shared date handling utilities for the application
 */

/**
 * Check if a date is in the future
 * Used for due date validation
 */
export function isDateInFuture(date: Date): boolean {
  const now = new Date();
  // Reset time components for accurate date comparison
  const inputDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  return inputDate.getTime() > today.getTime();
}

/**
 * Check if a task is overdue based on its due date
 * A task is overdue if its due date is before today (end of day)
 */
export function calculateOverdue(dueDate: Date): boolean {
  const now = new Date();
  // End of today
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  
  return dueDate.getTime() < endOfToday.getTime();
}

/**
 * Format a date to ISO string (YYYY-MM-DD)
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Format a date to ISO datetime string
 */
export function formatDateTime(date: Date): string {
  return date.toISOString();
}

/**
 * Parse an ISO date string to Date object
 */
export function parseISODate(dateString: string): Date {
  return new Date(dateString);
}

/**
 * Check if a string is a valid ISO date
 */
export function isValidISODate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && 
         /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(dateString);
}
