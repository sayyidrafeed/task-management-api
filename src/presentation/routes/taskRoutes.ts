import { Hono } from 'hono';
import type { TaskController } from '../controllers/TaskController';
import {
  validateCreateTask,
  validateUpdateTask,
  validateUpdateTaskStatus,
  validateTaskFilters,
  validateTaskIdParam
} from '../middleware/validation';

/**
 * Create Task Routes
 * Defines all task-related HTTP routes
 */
export function createTaskRoutes(controller: TaskController): Hono {
  const app = new Hono();

  // POST /tasks - Create a new task
  app.post('/tasks', validateCreateTask, (c) => controller.createTask(c));

  // GET /tasks - List all tasks with filtering
  app.get('/tasks', validateTaskFilters, (c) => controller.getTasks(c));

  // GET /tasks/:id - Get a single task
  app.get('/tasks/:id', validateTaskIdParam, (c) => controller.getTaskById(c));

  // PUT /tasks/:id - Update a task
  app.put('/tasks/:id', validateTaskIdParam, validateUpdateTask, (c) => controller.updateTask(c));

  // PATCH /tasks/:id/status - Update task status
  app.patch('/tasks/:id/status', validateTaskIdParam, validateUpdateTaskStatus, (c) => controller.updateStatus(c));

  // DELETE /tasks/:id - Delete a task
  app.delete('/tasks/:id', validateTaskIdParam, (c) => controller.deleteTask(c));

  return app;
}
