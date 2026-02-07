import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ValidationError } from '../../business/validators/TaskValidator';
import { TaskNotFoundError } from '../../business/services/TaskService';

/**
 * Global Error Handler
 * Handles all errors thrown in the application
 * Converts errors to appropriate HTTP responses
 */
export function errorHandler(err: Error | HTTPException, c: Context): Response {
  // Log error for debugging
  console.error('Error occurred:', {
    name: err.name,
    message: err.message,
    stack: err.stack
  });

  // Handle HTTPException (validation errors, etc.)
  if (err instanceof HTTPException) {
    // If the exception has a custom response, use it
    if (err.res) {
      return err.res;
    }

    return c.json({
      error: err.message,
      status: err.status
    }, err.status as 400 | 401 | 403 | 404 | 500);
  }

  // Handle validation errors from business layer
  if (err instanceof ValidationError) {
    return c.json({
      error: err.message,
      status: 400
    }, 400);
  }

  // Handle task not found errors
  if (err instanceof TaskNotFoundError) {
    return c.json({
      error: err.message,
      status: 404
    }, 404);
  }

  // Handle specific error messages
  if (err.message === 'Task not found') {
    return c.json({
      error: err.message,
      status: 404
    }, 404);
  }

  if (err.message.includes('Title is required') || 
      err.message.includes('Title must') ||
      err.message.includes('Description must')) {
    return c.json({
      error: err.message,
      status: 400
    }, 400);
  }

  if (err.message.includes('Due date must be in the future') ||
      err.message.includes('Invalid status') ||
      err.message.includes('Invalid priority') ||
      err.message.includes('Invalid status transition')) {
    return c.json({
      error: err.message,
      status: 400
    }, 400);
  }

  // Default: Internal server error
  // Don't expose internal details in production
  const isDevelopment = c.env?.NODE_ENV === 'development' || 
                        process.env.NODE_ENV === 'development';
  
  return c.json({
    error: 'Internal server error',
    ...(isDevelopment && { 
      details: err.message,
      stack: err.stack 
    }),
    status: 500
  }, 500);
}

/**
 * Not Found Handler
 * Handles 404 routes
 */
export function notFoundHandler(c: Context): Response {
  return c.json({
    error: 'Route not found',
    path: c.req.path,
    method: c.req.method,
    status: 404
  }, 404);
}
