import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { prisma } from './data/database/connection';
import { TaskRepository } from './data/repositories/TaskRepository';
import { TaskService } from './business/services/TaskService';
import { TaskController } from './presentation/controllers/TaskController';
import { createTaskRoutes } from './presentation/routes/taskRoutes';
import { errorHandler, notFoundHandler } from './presentation/middleware/errorHandler';

// Test database connection on startup
async function testDatabaseConnection(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('✓ Database connected successfully');
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    process.exit(1);
  }
}

// ============================================
// Data Layer
// ============================================

// Repository instantiation
const taskRepository = new TaskRepository(prisma);

// ============================================
// Business Layer
// ============================================

// Service instantiation with dependency injection
const taskService = new TaskService(taskRepository);

// ============================================
// Presentation Layer
// ============================================

// Controller instantiation
const taskController = new TaskController(taskService);

// Create route handlers
const taskRoutes = createTaskRoutes(taskController);

// ============================================
// Application Setup
// ============================================

const app = new Hono();

// Global middleware
app.use('*', logger());
app.use('*', cors({
  origin: '*', // Configure for production
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization']
}));

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.route('/api', taskRoutes);

// Global error handler
app.onError(errorHandler);

// 404 handler
app.notFound(notFoundHandler);

// ============================================
// Server Startup
// ============================================

const PORT = parseInt(process.env.PORT || '3000', 10);

async function startServer(): Promise<void> {
  // Test database connection before starting server
  await testDatabaseConnection();

  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║       Task Management API - Layered Architecture           ║
║                                                            ║
╠════════════════════════════════════════════════════════════╣
║  Environment: ${(process.env.NODE_ENV || 'development').padEnd(44)}║
║  Port: ${String(PORT).padEnd(53)}║
║                                                            ║
║  Endpoints:                                                ║
║  • GET    /health               - Health check             ║
║  • GET    /api/tasks            - List tasks               ║
║  • POST   /api/tasks            - Create task              ║
║  • GET    /api/tasks/:id        - Get task by ID           ║
║  • PUT    /api/tasks/:id        - Update task              ║
║  • PATCH  /api/tasks/:id/status - Update status            ║
║  • DELETE /api/tasks/:id        - Delete task              ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await prisma.$disconnect();
  console.log('Database disconnected');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...');
  await prisma.$disconnect();
  console.log('Database disconnected');
  process.exit(0);
});

// Start server
startServer();

// Export for Bun runtime
export default {
  port: PORT,
  fetch: app.fetch
};
