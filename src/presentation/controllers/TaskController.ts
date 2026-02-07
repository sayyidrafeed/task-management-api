import type { Context } from 'hono';
import type { TaskService } from '../../business/services/TaskService';
import type { 
  CreateTaskRequestDTO, 
  UpdateTaskRequestDTO, 
  TaskResponseDTO, 
  TaskListResponseDTO,
  SuccessMessageDTO
} from '../dto/TaskDTO';
import type { CreateTaskData, TaskFilters, UpdateTaskData, TaskStatus } from '../../common/types/Task';

/**
 * Task Controller
 * Handles HTTP requests and delegates to TaskService
 * All methods receive Hono Context and return Response
 */
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  /**
   * POST /tasks - Create a new task
   */
  async createTask(c: Context): Promise<Response> {
    const body = c.get('validatedData') as CreateTaskRequestDTO;

    const createData: CreateTaskData = {
      title: body.title,
      description: body.description,
      priority: body.priority,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined
    };

    const task = await this.taskService.createTask(createData);

    return c.json(this.toTaskResponseDTO(task), 201);
  }

  /**
   * GET /tasks - List all tasks with filtering
   */
  async getTasks(c: Context): Promise<Response> {
    const query = c.get('validatedData') as {
      status?: TaskStatus;
      priority?: import('../../common/types/Task').TaskPriority;
      isOverdue?: boolean;
      page: number;
      pageSize: number;
    };

    const filters: TaskFilters = {
      status: query.status,
      priority: query.priority,
      isOverdue: query.isOverdue,
      page: query.page,
      pageSize: query.pageSize
    };

    const result = await this.taskService.getTasks(filters);

    const response: TaskListResponseDTO = {
      tasks: result.tasks.map(task => this.toTaskResponseDTO(task)),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize
    };

    return c.json(response);
  }

  /**
   * GET /tasks/:id - Get a single task
   */
  async getTaskById(c: Context): Promise<Response> {
    const { id } = c.get('validatedData') as { id: string };

    const task = await this.taskService.getTaskById(id);

    if (!task) {
      return c.json({ error: 'Task not found', status: 404 }, 404);
    }

    return c.json(this.toTaskResponseDTO(task));
  }

  /**
   * PUT /tasks/:id - Update a task
   */
  async updateTask(c: Context): Promise<Response> {
    const { id } = c.get('validatedData') as { id: string };
    const body = c.get('validatedData') as UpdateTaskRequestDTO;

    const updateData: UpdateTaskData = {};
    
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.dueDate !== undefined) updateData.dueDate = new Date(body.dueDate);

    const task = await this.taskService.updateTask(id, updateData);

    return c.json(this.toTaskResponseDTO(task));
  }

  /**
   * PATCH /tasks/:id/status - Update task status
   */
  async updateStatus(c: Context): Promise<Response> {
    const { id } = c.get('validatedData') as { id: string };
    const body = c.get('validatedData') as { status: TaskStatus };

    const task = await this.taskService.updateTaskStatus(id, body.status);

    return c.json(this.toTaskResponseDTO(task));
  }

  /**
   * DELETE /tasks/:id - Delete a task (soft delete)
   */
  async deleteTask(c: Context): Promise<Response> {
    const { id } = c.get('validatedData') as { id: string };

    await this.taskService.deleteTask(id);

    const response: SuccessMessageDTO = {
      message: 'Task deleted successfully'
    };

    return c.json(response);
  }

  /**
   * Convert Task domain model to TaskResponseDTO
   */
  private toTaskResponseDTO(task: {
    id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: import('../../common/types/Task').TaskPriority;
    dueDate?: Date;
    isOverdue: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): TaskResponseDTO {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate?.toISOString(),
      isOverdue: task.isOverdue,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString()
    };
  }
}
