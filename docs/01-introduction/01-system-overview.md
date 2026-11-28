# Speprove Backend - Project Overview

## 1. General

- **Project:** Speprove Backend (`speprove-be`)
- **Version:** 1.0.0
- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express (v5)
- **Package manager:** pnpm (v10.26.2)

## 2. Architecture

The project is a **Modular Monolith** that combines a **Layered Pattern** with **Dependency Injection**:

- **Layered Pattern**:
  - **Controllers**: handle the HTTP request, validate input and return the response. They delegate the work to services.
  - **Services**: hold the business logic and call repositories and other services.
  - **Repositories**: talk to the database directly.
- **Dependency Injection (DI)**: services and repositories are injected with `tsyringe`.

## 3. Core technologies

- **Database**: MongoDB with Mongoose (`mongoose`).
- **Background jobs**: BullMQ (`bullmq`) on Redis (`ioredis`), with a management UI from `@bull-board`.
- **Validation**: Zod (`zod`).
- **Authentication**: JWT (`jsonwebtoken`).
- **Hashing**: Bcrypt.
- **Third-party integrations**:
  - Email: Brevo (`@getbrevo/brevo`).
  - Payments: PayOS (`@payos/node`).
  - Storage: Cloudinary.
  - LLM/AI: Groq (`groq-sdk`).
  - Speech: Microsoft Cognitive Services Speech SDK, Edge TTS.
- **Security and other utilities**: Helmet, CORS, Winston (logging), Multer (uploads).

## 4. Directory structure

`src/` holds the entry point `index.ts` and six folders. The layout was fixed by the module layout refactor ([spec](../specs/module-layout/requirements.md), [file mapping](../specs/module-layout/mapping.md)).

### `src/config/`

Application configuration: the environment schema (`env.config.ts`), CORS, MongoDB and Redis settings. Nothing here knows a business concept.

### `src/core/`

Technical code without business names, grouped by concern:

- `persistence/`: base classes (`BaseRepository`, `BaseMapper`, base model, query builder, base validation helpers).
- `http/`: response envelope and controller binding (`ResponseTransformer`, `bindHandler`).
- `middlewares/`: authentication, error handling, request id, validation and the socket handshake.
- `rate-limiter/`: the Redis-backed rate limiter and its middleware.
- `errors/`: `AppError` and the error code registry.
- `security/`: hashing, JWT and the contracts they implement.
- `types/`, `utils/`, `constants/`, `di/`: shared types, helpers, the status enum and the DI tokens.
- `cache/`, `redis/`, `logging/`: cache service, Redis clients, JSON logger, request context and redaction.
- `lifecycle/`: the `/health` and `/ready` probes and the bounded shutdown.
- `queue/`: the BullMQ queue factory, the base producer, the worker factory and the base consumer, and the queue dashboard.
- `realtime/`: the Socket.io server wrapper and the event constants of scoring.

### `src/main/`

The composition root, the only place allowed to import every module: the Express app (`app.ts`), the DI container, the route table, the Socket.io wiring and the worker start.

### `src/modules/`

Ten business modules. A module with two or more entities has one folder per entity; the others are flat.

- `account` (profile; sub-folders `group/`, `permission/`, `permission-group/`) and `auth` (credentials, OTP, Google; sub-folders `session/`, `social-identity/`).
- `content` (sub-folders `topic/`, `question/`, `forecast/`, `forecast-topic/`, `forecast-question/`, `vocabulary/`, `voice/`).
- `practice` (sub-folders `attempt/`, `mock-test/`, `jobs/`) and `assessment` (scoring stages with `adapters/` for Groq, Azure and the evaluator).
- `billing` (sub-folders `payment/`, `package/`, `wallet/`).
- `file` (upload, storage and ffmpeg adapters), `tts` (generated audio cache and the TTS providers).
- `voice-room` (rooms and the LiveKit adapter) and `notification` (email, its jobs and templates).

### `src/scripts/` and `src/types/`

The seed script and the global type declarations. Unchanged.

## 5. Coding conventions

The conventions have their own documents, so each fact lives in one place:

- Code style, naming, errors, logging, data access: [coding standards](../07-development-guides/01-coding-standards.md).
- Layers, dependency injection, module boundaries, authorization: [layers and modules](../07-development-guides/02-layers-and-modules.md).
- Response shape and status codes: [API conventions](../08-integration-contracts/01-api-conventions.md); error codes: [error code registry](../08-integration-contracts/02-error-codes.md).

## 6. NPM scripts

- `pnpm dev`: start the app with `nodemon` for development (auto-reload).
- `pnpm clean`: delete the `dist` folder.
- `pnpm build`: compile TypeScript into `dist`.
- `pnpm start`: run the compiled `dist/index.js`.
- `pnpm lint`, `pnpm lint:fix`: check and fix lint errors with ESLint.
- `pnpm format`, `pnpm check`: format the code with Prettier.
- `pnpm test`, `pnpm test:watch`, `pnpm test:coverage`: run the Vitest suite once, in watch mode, or with a coverage report
- `pnpm deps`: module boundary check (`dependency-cruiser`, warnings only for now) ([testing strategy](../06-testing/01-testing-strategy.md)).
- `pnpm db:seed`: run the data seeding script.
