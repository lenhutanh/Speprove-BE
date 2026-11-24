# App Foundation: Design (Backend)

> Repository: `speprove-be`. Branch: `feat/app-foundation`.
> Requirements: [requirements.md](./requirements.md) (AC1 to AC11).
> Status: **Step 2: Design (awaiting approval)**.
> Note: sections 2.1 to 2.4 describe what the first two commits did, read back from their commit messages and from the code. The alternatives that were weighed when they were written were not recorded.

---

## 1. Overview

1.1. **Approach:** make the application constructible without side effects, give it one logger and two probes, bound its shutdown, put timeouts and honest defaults in the configuration, and add a harness that runs the real routes against an in-memory database.
1.2. **Alternatives considered (last two commits):**
1.2.1. *Hide the probe headers with `app.disable('x-powered-by')` instead of reordering.* Rejected: it hides one header; the probes would still lack the other helmet headers (AC9).
1.2.2. *`AsyncLocalStorage.enterWith(undefined)` before creating a Redis client.* Rejected: `enterWith` changes the context of the rest of the request; `exit(fn)` scopes the change to `fn`.
1.2.3. *Create the Redis clients at boot.* Rejected for this ticket: it changes the start-up order and the test container.
1.3. **Requirement refinements:** none.

---

## 2. Backend Changes

### 2.1. Runtime (commit `3db0e35`, AC1 to AC6)

| Area | Files | AC |
| :--- | :--- | :--- |
| App factory | `src/app.ts`, `src/index.ts`, `src/bootstrap/container.ts` | AC1 |
| Logger and request id | `src/infrastructure/logging/` (`logger.ts`, `request-context.ts`, `sanitize.ts`), `src/common/middlewares/request-id.middleware.ts`, `error.middleware.ts`, queue producers | AC2 |
| Probes | `src/infrastructure/health/health.router.ts` | AC3 |
| Shutdown | `src/index.ts` | AC4 |
| Configuration and timeouts | `src/common/config/` (`env.config.ts`, `redis.config.ts`, `mongodb.config.ts`), providers (Groq, Azure audio download, PayOS) | AC5 |
| Container | `Dockerfile`, `pnpm-workspace.yaml`, `.env.example` | AC6 |

### 2.2. Tests and CI (commit `42fb4fc`, AC7, AC8)

2.2.1. `vitest.config.mts` sets the test environment inside the config so that `.env` is never read; `tests/setup.ts`, `tests/helpers/` (in-memory Mongo, in-memory fakes for cache, rate limiter and queues, token helper) and the test files under `tests/api/`, `tests/db/` and `tests/unit/`.
2.2.2. `.github/workflows/ci.yml` runs lint, build, test, `pnpm audit --audit-level=high` and gitleaks.

### 2.3. Health probes behind helmet (commit `d224a36`, AC9)

`src/app.ts` order: `requestIdMiddleware`, `helmet()`, health router, `cookieParser()`, `cors()`, `express.json()`. The probes stay before `cors()` and the body parser. Test in `tests/api/http-basics.test.ts`.

### 2.4. Redis log context (commit `67f0af5`, AC10)

`runOutsideRequest(fn)` in `request-context.ts` is `storage.exit(fn)`; `createRedisClient` builds the client inside it. Only the constructor needs it; commands issued by request code keep the request context. Test in `tests/unit/redis-factory.test.ts` mocks `ioredis` with a class that records `getRequestId()` in its constructor.

---

## 3. Files of the Last Two Commits (AC11)

| File | Change | AC |
| :--- | :--- | :--- |
| `src/app.ts` | Reorder as in 2.3 | AC9 |
| `src/infrastructure/logging/request-context.ts` | Add `runOutsideRequest` | AC10 |
| `src/infrastructure/redis/redis.factory.ts` | Construct the client inside `runOutsideRequest` | AC10 |
| `tests/api/http-basics.test.ts` | One new test | AC9 |
| `tests/unit/redis-factory.test.ts` | New file, one test | AC10 |

---

## 4. Risks and Rollback

4.1. Only the probes (AC3) have automated tests. Shutdown and timeouts (AC4, AC5) have none. An earlier session checked the probes and a Redis outage by hand against a built app (13 of 14 checks passed, the failing one being the helmet order fixed by AC9); the exit codes on `SIGTERM` and `SIGINT` were never checked.
4.2. Rollback: revert the commits; no data or API is involved.
