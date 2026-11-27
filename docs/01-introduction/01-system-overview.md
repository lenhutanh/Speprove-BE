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

### `src/common/`

Shared building blocks used across the whole application:

- `base/`: base classes such as `BaseRepository` and `BaseMapper`.
- `config/`: app configuration (environment, database, Swagger, etc.).
- `constants/`: constants, enums, error codes, DI tokens.
- `errors/`: custom error classes (e.g. `AppError`).
- `http/`: response envelope and controller binding helpers (`ResponseTransformer`, `bindHandler`).
- `contracts/`, `types/`: shared type definitions.
- `middlewares/`: Express middlewares (auth, error handling, validation).
- `utils/`: helper functions.

### `src/infrastructure/`

Connections to external systems and shared infrastructure:

- `cache/`, `redis/`: caching.
- `event-bus/`: internal pub/sub.
- `logging/`: logger setup (Winston).
- `providers/`: external service integrations (LLM, mail, speech, storage, etc.).
- `queues/`, `workers/`: background job processing (BullMQ).
- `socket/`: Socket.io server and event constants.
- `livekit/`: LiveKit integration for voice rooms.
- `rate-limiter/`: HTTP rate limiting.
- `security/`: hashing and JWT helpers.

### `src/modules/`

The business domains. Each module is self-contained, with its own controller, service, repository, model, DTO, mapper, routes and DI file:

- **Accounts & permissions**: `account`, `account-provider`, `auth`, `permission`, `permission-group`.
- **Payments & credits**: `payment`, `credit-package`, `credit-log`.
- **IELTS speaking content**: `forecast`, `forecast-topic`, `forecast-question`, `topic`, `question`, `vocabulary-suggestion`.
- **Practice sessions**: `session`, `speaking-session`, `attempt`.
- **User groups**: `group`.
- **Audio & voice**: `speech`, `voice`, `generated-audio`, `voice-room`.
- **Other utilities**: `file`, `mail`.

### `src/routes/`

Aggregates all the main API routes.

## 5. Coding conventions

1. **Error handling**: throw `AppError` from services for business errors. `errorMiddleware` catches it and formats the response.
2. **Validation**: declare Zod schemas in `*.validation.ts` and check input with `validateMiddleware` in the routes.
3. **Data transfer**: use DTOs (`*.dto.ts`) for requests and mappers (`*.mapper.ts`) to map between DB data and API responses.
4. **Database**: extend `BaseRepository`. Use a `session` transaction when updating several documents at once.
5. **Types**: make full use of TypeScript type checking and avoid `any`.
6. **Dependency injection**: use the `tsyringe` decorators (`@singleton()`, `@injectable()`) and register classes explicitly in the `*.di.ts` files.

## 6. NPM scripts

- `pnpm dev`: start the app with `nodemon` for development (auto-reload).
- `pnpm clean`: delete the `dist` folder.
- `pnpm build`: compile TypeScript into `dist`.
- `pnpm start`: run the compiled `dist/index.js`.
- `pnpm lint`, `pnpm lint:fix`: check and fix lint errors with ESLint.
- `pnpm format`, `pnpm check`: format the code with Prettier.
- `pnpm db:seed`: run the data seeding script.
