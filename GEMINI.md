# Speprove Backend - Development Guidelines

This document outlines the architectural patterns, coding conventions, and workflows for the Speprove backend project.

## Architecture

The project follows a **Modular Monolith** architecture with a layered approach, heavily utilizing **Dependency Injection**.

- **Layered Pattern:**
  - **Controllers (`*.controller.ts`):** Handle HTTP requests, input validation, and send responses. They delegate business logic to Services.
  - **Services (`*.service.ts`):** Contain the core business logic. They orchestrate data access via Repositories and communicate with other services.
  - **Repositories (`*.repository.ts`):** Abstract data access logic. They interact directly with the database (Mongoose).
- **Dependency Injection:** `tsyringe` is used for DI. Services and Repositories are registered using tokens (defined in `src/common/constants/tokens.ts`) and injected via constructors.

## Core Technologies

- **Runtime/Framework:** Node.js, Express (v5)
- **Language:** TypeScript
- **Database:** MongoDB with Mongoose
- **Background Jobs:** BullMQ with Redis
- **Validation:** Zod
- **Package Manager:** pnpm

## Project Structure

- `src/common/`: Shared resources across the application.
  - `base/`: Base classes (e.g., `BaseRepository`, `BaseMapper`).
  - `config/`: Application configurations (env, db, swagger, etc.).
  - `constants/`: Enums, error codes, injection tokens.
  - `errors/`: Custom error classes (e.g., `AppError`).
  - `middlewares/`: Express middlewares (auth, error handling, validation).
  - `utils/`: Helper functions.
- `src/infrastructure/`: Cross-cutting concerns and external integrations.
  - `cache/`, `redis/`: Caching mechanisms.
  - `event-bus/`: Internal event publishing/subscribing.
  - `providers/`: External service integrations (LLM, Mail, Speech, Storage).
  - `queues/`, `workers/`: Background job processing.
- `src/modules/`: Domain-specific modules (e.g., `account`, `auth`, `attempt`). Each module is self-contained with its controller, service, repository, model, and routes.
- `src/routes/`: Main API routing aggregation.

## Coding Conventions

1.  **Error Handling:** Throw `AppError` from services for expected business logic errors. The centralized `errorMiddleware` will catch these and format the HTTP response.
2.  **Validation:** Use Zod schemas defined in `*.validation.ts` files. Validate requests in routes using the `validateMiddleware`.
3.  **Data Transfer:** Use DTOs (Data Transfer Objects) defined in `*.dto.ts` for incoming requests and mappers (`*.mapper.ts`) to transform data between the database and API responses.
4.  **Database Access:**
    - Extend `BaseRepository` for standard CRUD operations, pagination, and soft deletes.
    - Always use `session` for transactions when performing multi-document updates.
5.  **Types:** Rely on TypeScript interfaces and types heavily to ensure type safety. Avoid `any`.
6.  **Dependency Injection:** Ensure all services and repositories are decorated with `@singleton()` or appropriate tsyringe decorators and are registered in their respective `*.di.ts` files or globally.

## Useful Scripts

- `pnpm dev`: Start the development server using nodemon.
- `pnpm build`: Build the TypeScript code into the `dist` folder.
- `pnpm check`: Run ESLint and Prettier checks.
- `pnpm lint:fix`: Automatically fix ESLint issues.
- `pnpm format`: Format code using Prettier.
- `pnpm db:seed`: Run database seeding scripts.
