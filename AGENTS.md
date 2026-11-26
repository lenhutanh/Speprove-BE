# AGENTS.md

Guidance for AI coding assistants working in this repository. `CLAUDE.md` imports this file.

Speprove backend: a Node.js + Express 5 + TypeScript modular monolith for an IELTS Speaking practice platform. It uses MongoDB/Mongoose, Redis, BullMQ, Socket.io and LiveKit. Package manager is pnpm (v10).

## Commands

- `pnpm dev`: nodemon + ts-node with `tsconfig-paths`. Watches `src` and `.env`. Listens on `APP_PORT` (default 5000).
- `pnpm build`: `tsc` + `tsc-alias` into `dist/`. `pnpm start` runs `dist/index.js`.
- `pnpm lint` / `pnpm lint:fix` / `pnpm format` / `pnpm check` (ESLint + Prettier check)
- `pnpm db:seed`: seeds master and mock data (`src/scripts/seed.ts`)
- Docker: `docker compose -f docker-compose.dev.yaml up --build`
- `pnpm test`: Vitest with supertest and an in-memory MongoDB (`tests/`). End-to-end tests against a deployed system live in the separate `speprove-testing` repo.
- `src/common/config/env.config.ts` validates env with Zod at startup, so a missing variable crashes boot. Copy `.env.example` to `.env` to get started.
- All REST routes are mounted under `/api/v1` (`src/routes/index.ts`), with singular resource names (`/attempt`, `/payment`, `/speaking-session`). There is no Swagger: the API contract is in `docs/08-integration-contracts/`.

## Architecture

Request flow: Express router → middlewares (rate limiter, auth, Zod `validateMiddleware`) → controller → service → repository → Mongoose. Services push long-running work onto BullMQ queues (`src/infrastructure/queues`). Workers (`src/infrastructure/workers/consumers`, e.g. `speaking.consumer.ts`, `mail.consumer.ts`) process those jobs and send progress to clients through Socket.io (`src/infrastructure/socket`). `src/index.ts` boots in this order: queues first, then Bull Board, workers, HTTP. Shutdown stops the workers first.

Each `src/modules/<name>/` packages its own `*.model.ts`, `*.repository(.interface).ts`, `*.service.ts`, `*.controller.ts`, `*.route.ts`, `*.validation.ts` (Zod), `*.dto.ts`, `*.mapper.ts` and `*.di.ts`.
- DI uses `tsyringe`: classes use `@injectable()`/`@singleton()`; each `*.di.ts` registers interface tokens from `src/common/constants/di.tokens.ts`; `src/bootstrap/container.ts` wires all modules together.
- Repositories extend `BaseRepository` (`src/common/base`). Use Mongo `session` transactions for writes that touch several documents.
- Services throw `AppError` for business errors, and `errorMiddleware` formats the response.
- Import alias: `~/*` → `src/*`.

External integrations sit behind interfaces in `src/infrastructure/providers/` (llm/Groq, stt/Groq, tts/Edge TTS, speech-assessment/Azure, evaluator, storage/Cloudinary, mail/Brevo, media/ffmpeg). Payments go through PayOS.

The AI scoring pipeline (the `attempt` and `speaking-session` modules) runs in stages: STT → pronunciation assessment → LLM evaluation → band score. Failed stages are retried, progress is reported over Socket.io, and credits are refunded automatically if processing fails.

## Docs

`docs/layout-and-index.md` is the index and `docs/docs-update-guidelines.md` holds the writing rules. **Before you change something, read the document for it from this table, and update the document in the same change when behavior changes.**

| If the task touches... | Read first |
| :--- | :--- |
| Any code you write | `docs/07-development-guides/01-coding-standards.md` |
| Where code goes, layers, module boundaries, DI, permissions | `docs/07-development-guides/02-layers-and-modules.md` |
| A request or response, a status code, pagination | `docs/08-integration-contracts/01-api-conventions.md` |
| An error or an `errorCode` | `docs/08-integration-contracts/02-error-codes.md` |
| A test, a bug fix, a refactor | `docs/06-testing/01-testing-strategy.md` |
| A new feature, or a spec | `docs/04-business-logic/03-feature-design-guide.md` |
| Scoring: queue stages, statuses, socket events, retries, refunds | `docs/04-business-logic/01-ai-scoring.md` |
| Payment, PayOS webhook, credit, the balance and CreditLog invariant | `docs/04-business-logic/02-payment-and-credit.md` |
| The big picture and directory structure | `docs/01-introduction/01-system-overview.md` |
| The module layout the refactor is heading to | `docs/specs/architecture-refactor/design.md` |

## Modularity rules (from `../architecture_roadmap.md`)

The monolith is meant to be split into microservices later, so code must follow these rules:
1. **Database-per-module:** a module touches only its own models. Never `.populate()` into another module's model. Fetch raw IDs, then go through the other module's service interface, or merge the data in the mapper/controller.
2. **Cross-module calls:** inject the other module's *interface* through constructor injection (tsyringe). Never import another module's repository, controller or helpers directly. For async work, use a BullMQ job (the in-process event bus was removed). Financial, score and exam-state work must be idempotent.
3. **DTO/Mapper boundary:** all data entering or leaving a module goes through DTOs and mappers.

## Workflow

Before starting a task, read `docs/plan/handoff.md` (current state, next step, working agreement) and `docs/plan/backlog.md` (progress board).

A new feature, or a change spanning several modules or both BE and FE, has a spec in `docs/specs/<feature-name>/` (`requirements.md`, `design.md`, `tasks.md`). If one already exists for the task, read it first and continue from `tasks.md`. Documentation changes and small fixes need no spec.
