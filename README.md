# Task Management API

A production-ready Task Management REST API built with **TypeScript** and **Bun**, demonstrating clean layered architecture principles. This project serves as a learning experiment for implementing scalable, maintainable backend systems.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
  - [Endpoints](#endpoints)
  - [Request/Response Examples](#requestresponse-examples)
- [Testing](#testing)
- [Database Management](#database-management)
- [Contributing](#contributing)

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| [Bun](https://bun.sh/) | 1.3.5+ | Fast all-in-one JavaScript runtime |
| [TypeScript](https://www.typescriptlang.org/) | 5.x+ | Type-safe development |
| [Hono](https://hono.dev/) | 4.x | Lightweight, ultrafast web framework |
| [Prisma ORM](https://www.prisma.io/) | 7.x | Modern database toolkit |
| [PostgreSQL](https://www.postgresql.org/) | 17 | Relational database |
| [Zod](https://zod.dev/) | 4.x | Schema validation |
| [Docker](https://www.docker.com/) | - | Containerization |
| [Bun Test](https://bun.sh/docs/test) | Built-in | Testing framework |

### Why This Stack?

- **Bun**: Significantly faster startup and execution than Node.js
- **Hono**: Minimal footprint, excellent TypeScript support, middleware-based architecture
- **Prisma**: Type-safe database access with excellent migration tools
- **TypeScript**: Compile-time type checking for reliability

---

## Architecture Overview

This project implements a **Layered Architecture** (also known as n-tier architecture) with clear separation of concerns. The architecture follows the principle of **dependency inversion**, where each layer only knows about the layer directly beneath it.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Presentation Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │  Controllers │  │    Routes    │  │  Middleware  │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
├─────────────────────────────────────────────────────────────────────┤
│                          Business Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │  Services    │  │  Validators  │  │  Workflows   │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
├─────────────────────────────────────────────────────────────────────┤
│                           Data Layer                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │ Repositories │  │   Models     │  │  Connection  │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
├─────────────────────────────────────────────────────────────────────┤
│                          Common Layer                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │   Types     │  │  Constants   │  │    Utils     │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
└─────────────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

| Layer | Purpose | Key Components |
|-------|---------|----------------|
| **Presentation** | Handle HTTP requests/responses, routing, input validation | Controllers, Routes, DTOs, Middleware |
| **Business** | Implement core business logic, rules, and workflows | Services, Validators, Workflows |
| **Data** | Manage database access, abstraction, and persistence | Repositories, Models, Database Connection |
| **Common** | Provide shared types, utilities, and constants | Types, Constants, Utils |

### Architecture Principles

1. **Separation of Concerns**: Each layer has a single, well-defined responsibility
2. **Dependency Inversion**: Higher-level modules depend on abstractions, not implementations
3. **Single Responsibility**: Classes and functions do one thing well
4. **Composition Root**: Dependencies are wired in `main.ts` (Composition Root)
5. **Interface Segregation**: Repositories use interfaces to define contracts

---

## Project Structure

```
task-management-api/
├── src/
│   ├── main.ts                        # Application entry point
│   │                                   # Composition Root - wires all dependencies
│   ├── common/                        # Shared across all layers
│   │   ├── constants/
│   │   │   └── taskConstants.ts       # Pagination limits, task constraints
│   │   ├── types/
│   │   │   ├── Task.ts                # Domain Task type
│   │   │   ├── enums.ts               # TaskStatus, TaskPriority enums
│   │   │   └── index.ts               # Type exports
│   │   └── utils/
│   │       └── dateUtils.ts           # Date helper functions
│   ├── presentation/                  # HTTP layer
│   │   ├── controllers/
│   │   │   └── TaskController.ts      # Request handlers
│   │   ├── routes/
│   │   │   └── taskRoutes.ts          # Route definitions
│   │   ├── middleware/
│   │   │   ├── errorHandler.ts        # Global error handling
│   │   │   └── validation.ts          # Input validation middleware
│   │   └── dto/
│   │       └── TaskDTO.ts             # Request/Response DTOs
│   ├── business/                      # Business logic layer
│   │   ├── services/
│   │   │   └── TaskService.ts         # Core service logic
│   │   ├── validators/
│   │   │   └── TaskValidator.ts       # Business rule validation
│   │   └── workflows/
│   │       └── TaskWorkflow.ts        # Workflow definitions
│   └── data/                           # Data access layer
│       ├── database/
│       │   └── connection.ts          # Prisma client setup
│       ├── repositories/
│       │   ├── TaskRepository.ts      # Data access implementation
│       │   └── ITaskRepository.ts     # Repository interface
│       └── models/
│           └── TaskModel.ts           # Data model with helpers
├── tests/
│   ├── unit/
│   │   └── business/
│   │       └── TaskService.test.ts    # Unit tests for services
│   ├── integration/
│   │   └── api.test.ts                # API integration tests
│   └── mocks/
│       └── MockTaskRepository.ts      # Mock for testing
├── prisma/
│   ├── schema.prisma                  # Database schema
│   └── migrations/                    # Migration files
├── docker-compose.yml                  # PostgreSQL & pgAdmin
├── bunfig.toml                         # Bun configuration
├── tsconfig.json                       # TypeScript configuration
├── .env.example                        # Environment template
└── package.json                        # Dependencies & scripts
```

---

## Features

### Task Management
- ✅ Create, Read, Update, Delete (CRUD) operations
- ✅ Soft delete implementation
- ✅ Pagination and filtering
- ✅ Task prioritization (LOW, MEDIUM, HIGH)

### Status Workflow
```
TODO ──► IN_PROGRESS ──► DONE
  ▲           │            │
  │           │            │
  │           ▼            │
  └────────────────────────┘

- TODO → IN_PROGRESS (Start working on task)
- IN_PROGRESS → TODO (Mark as not started)
- IN_PROGRESS → DONE (Complete task)
- TODO → DONE (Direct completion not allowed)
```

### Validation
- **Input Validation**: Zod schemas validate request payloads
- **Business Validation**: Rules enforced in business layer
- **Status Transitions**: Controlled workflow state changes
- **Due Date**: Must be in the future when specified

---

## Getting Started

### Prerequisites

- **Bun** 1.3.5 or higher ([Install](https://bun.sh/docs/installation))
- **Docker** & **Docker Compose** ([Install](https://docs.docker.com/get-docker/))
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd task-management-api
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Start the database** (PostgreSQL + pgAdmin)
   ```bash
   docker-compose up -d
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env
   ```

5. **Run database migrations**
   ```bash
   bun run db:migrate
   ```

6. **Generate Prisma client**
   ```bash
   bun run db:generate
   ```

### Configuration

Create a `.env` file based on `.env.example`:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/taskmanagement?schema=public"

# Server
PORT=3000
NODE_ENV=development
```

**Configuration Options:**

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `PORT` | HTTP server port | 3000 |
| `NODE_ENV` | Environment mode | development |

### Running the Application

**Development mode (with hot reload):**
```bash
bun run dev
```

**Production mode:**
```bash
bun run start
```

**Verify the server is running:**
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-02-07T05:00:00.000Z",
  "environment": "development"
}
```

---

## API Documentation

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/api/tasks` | Create a new task |
| `GET` | `/api/tasks` | List tasks (with filtering & pagination) |
| `GET` | `/api/tasks/:id` | Get task by ID |
| `PUT` | `/api/tasks/:id` | Update task |
| `PATCH` | `/api/tasks/:id/status` | Update task status |
| `DELETE` | `/api/tasks/:id` | Delete task (soft delete) |

### Query Parameters (GET /api/tasks)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | string | - | Filter by status (TODO, IN_PROGRESS, DONE) |
| `priority` | string | - | Filter by priority (LOW, MEDIUM, HIGH) |
| `isOverdue` | boolean | - | Filter by overdue status |
| `page` | number | 1 | Page number |
| `pageSize` | number | 10 | Items per page (max: 100) |

### Request/Response Examples

#### Create Task

**Request:**
```bash
POST /api/tasks
Content-Type: application/json

{
  "title": "Learn TypeScript",
  "description": "Complete the TypeScript course",
  "priority": "HIGH",
  "dueDate": "2026-12-31T23:59:59Z"
}
```

**Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Learn TypeScript",
  "description": "Complete the TypeScript course",
  "status": "TODO",
  "priority": "HIGH",
  "dueDate": "2026-12-31T23:59:59.000Z",
  "isOverdue": false,
  "createdAt": "2026-02-07T05:00:00.000Z",
  "updatedAt": "2026-02-07T05:00:00.000Z"
}
```

#### List Tasks

**Request:**
```bash
GET /api/tasks?status=TODO&page=1&pageSize=10
```

**Response:**
```json
{
  "tasks": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Learn TypeScript",
      "description": "Complete the TypeScript course",
      "status": "TODO",
      "priority": "HIGH",
      "dueDate": "2026-12-31T23:59:59.000Z",
      "isOverdue": false,
      "createdAt": "2026-02-07T05:00:00.000Z",
      "updatedAt": "2026-02-07T05:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "pageSize": 10
}
```

#### Update Status

**Request:**
```bash
PATCH /api/tasks/:id/status
Content-Type: application/json

{
  "status": "IN_PROGRESS"
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Learn TypeScript",
  "status": "IN_PROGRESS",
  ...
}
```

#### Error Response

```json
{
  "error": "Task not found",
  "status": 404
}
```

---

## Testing

### Running Tests

**Run all tests:**
```bash
bun test
```

**Run tests with watch mode:**
```bash
bun test:watch
```

**Run specific test file:**
```bash
bun test tests/integration/api.test.ts
```

### Test Structure

| Directory | Purpose | Coverage |
|-----------|---------|----------|
| `tests/unit/` | Unit tests for business logic | Services, Validators |
| `tests/integration/` | API integration tests | Full request/response cycle |
| `tests/mocks/` | Mock implementations | Repository mocks |

### Test Coverage

The project includes:
- ✅ Unit tests for `TaskService`
- ✅ Integration tests for all API endpoints
- ✅ Mock repository for isolated testing
- ✅ Validation error handling tests

---

## Database Management

### Available Commands

| Command | Description |
|---------|-------------|
| `bun run db:migrate` | Run pending migrations |
| `bun run db:generate` | Generate Prisma client |
| `bun run db:studio` | Open Prisma Studio (GUI) |
| `bun run db:seed` | Seed database with sample data |

### Database Tools

- **Prisma Studio**: `bun run db:studio` (http://localhost:5555)
- **pgAdmin**: http://localhost:5050 (admin@admin.com / admin)

### Migrations

Database migrations are stored in `prisma/migrations/`. To create a new migration:

```bash
bun run db:migrate
```

---

## Contributing

This is a learning project, but suggestions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

## Acknowledgments

- [Bun](https://bun.sh/) - Fast JavaScript runtime
- [Hono](https://hono.dev/) - Excellent web framework
- [Prisma](https://www.prisma.io/) - Modern ORM
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) - Architecture inspiration
