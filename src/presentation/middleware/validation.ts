import { z } from 'zod';
import type { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { TASK_CONSTRAINTS } from '../../common/constants/taskConstants';

/**
 * Create Task Schema
 * Validates request body for creating a new task
 */
export const createTaskSchema = z.object({
  title: z.string()
    .min(TASK_CONSTRAINTS.TITLE_MIN_LENGTH, 'Title is required')
    .max(TASK_CONSTRAINTS.TITLE_MAX_LENGTH, `Title must not exceed ${TASK_CONSTRAINTS.TITLE_MAX_LENGTH} characters`),
  description: z.string()
    .max(TASK_CONSTRAINTS.DESCRIPTION_MAX_LENGTH, `Description must not exceed ${TASK_CONSTRAINTS.DESCRIPTION_MAX_LENGTH} characters`)
    .optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH'])
    .optional()
    .default('MEDIUM'),
  dueDate: z.string()
    .datetime({ message: 'Due date must be a valid ISO datetime string' })
    .optional()
    .transform((val) => val ? new Date(val) : undefined)
    .refine((date) => {
      if (!date) return true;
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return date >= today;
    }, { message: 'Due date must be today or in the future' })
});

/**
 * Update Task Schema
 * Validates request body for updating a task
 */
export const updateTaskSchema = z.object({
  title: z.string()
    .min(TASK_CONSTRAINTS.TITLE_MIN_LENGTH, 'Title is required')
    .max(TASK_CONSTRAINTS.TITLE_MAX_LENGTH, `Title must not exceed ${TASK_CONSTRAINTS.TITLE_MAX_LENGTH} characters`)
    .optional(),
  description: z.string()
    .max(TASK_CONSTRAINTS.DESCRIPTION_MAX_LENGTH, `Description must not exceed ${TASK_CONSTRAINTS.DESCRIPTION_MAX_LENGTH} characters`)
    .optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH'])
    .optional(),
  dueDate: z.string()
    .datetime({ message: 'Due date must be a valid ISO datetime string' })
    .optional()
    .transform((val) => val ? new Date(val) : undefined)
    .refine((date) => {
      if (!date) return true;
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return date >= today;
    }, { message: 'Due date must be today or in the future' })
});

/**
 * Update Task Status Schema
 * Validates request body for updating task status
 */
export const updateTaskStatusSchema = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE'], {
    required_error: 'Status is required',
    invalid_type_error: 'Status must be one of: TODO, IN_PROGRESS, DONE'
  })
});

/**
 * Task Filters Schema
 * Validates query parameters for listing tasks
 */
export const taskFiltersSchema = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE'])
    .optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH'])
    .optional(),
  isOverdue: z.enum(['true', 'false'])
    .optional()
    .transform((val) => val === 'true'),
  page: z.string()
    .optional()
    .default('1')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 1, { message: 'Page must be at least 1' }),
  pageSize: z.string()
    .optional()
    .default('20')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 1 && val <= 100, { message: 'Page size must be between 1 and 100' })
});

/**
 * Task ID Param Schema
 * Validates task ID in URL parameters
 */
export const taskIdParamSchema = z.object({
  id: z.string().uuid({ message: 'Invalid task ID format' })
});

/**
 * Validation error response type
 */
interface ValidationErrorResponse {
  errors: Array<{
    field: string;
    message: string;
  }>;
}

/**
 * Create validation middleware
 * Generic middleware creator for Zod schema validation
 */
function createValidationMiddleware<T extends z.ZodTypeAny>(
  schema: T,
  source: 'json' | 'query' | 'param'
) {
  return async (c: Context, next: Next): Promise<void> => {
    let data: unknown;

    try {
      switch (source) {
        case 'json':
          data = await c.req.json();
          break;
        case 'query':
          data = c.req.query();
          break;
        case 'param':
          data = c.req.param();
          break;
      }
    } catch {
      throw new HTTPException(400, { message: `Invalid ${source} format` });
    }

    const result = schema.safeParse(data);

    if (!result.success) {
      // Handle Zod 4.x error format - use issues instead of errors
      const issues = (result.error as unknown as { issues?: Array<{ path: (string | number)[]; message: string }> }).issues || 
                     (result.error as { errors?: Array<{ path: (string | number)[]; message: string }> }).errors || [];
      
      const errors = issues.map((err) => ({
        field: Array.isArray(err.path) ? err.path.join('.') : String(err.path),
        message: err.message
      }));

      throw new HTTPException(400, {
        message: 'Validation failed',
        res: new Response(
          JSON.stringify({ errors } as ValidationErrorResponse),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      });
    }

    // Store validated data in context (merge with existing data if present)
    const existingData = c.get('validatedData') || {};
    c.set('validatedData', { ...existingData, ...result.data });
    await next();
  };
}

/**
 * Validation Middlewares
 */
export const validateCreateTask = createValidationMiddleware(createTaskSchema, 'json');
export const validateUpdateTask = createValidationMiddleware(updateTaskSchema, 'json');
export const validateUpdateTaskStatus = createValidationMiddleware(updateTaskStatusSchema, 'json');
export const validateTaskFilters = createValidationMiddleware(taskFiltersSchema, 'query');
export const validateTaskIdParam = createValidationMiddleware(taskIdParamSchema, 'param');
