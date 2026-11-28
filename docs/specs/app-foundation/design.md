# App Foundation: Design (Backend)

> Repository: `speprove-be`. Branch: `feat/app-foundation`.
> Requirements: [requirements.md](./requirements.md) (AC1 to AC11).
> Status: **Step 2: Design (approved 2026-11-25)**.
> Note: sections 2.1 to 2.4 describe what the first two commits did, read back from their commit messages and from the code. The alternatives that were weighed when they were written were not recorded.

---

## 1. Overview

1.1. **Approach:** make the application constructible without side effects, give it one logger and two probes, bound its shutdown, put timeouts and honest defaults in the configuration, and add a harness that runs the real routes against an in-memory database.
1.2. **Alternatives considered (last two commits):**
1.2.1. *Hide the probe headers with `app.disable('x-powered-by')` instead of reordering.* Rejected: it hides one header; the probes would still lack the other helmet headers (AC9).
1.2.2. *`AsyncLocalStorage.enterWith(undefined)` before creating a Redis client.* Rejected: `enterWith` changes the context of the rest of the request; `exit(fn)` scopes the change to `fn`.
1.2.3. *Create the Redis clients at boot.* Rejected for this ticket: it changes the start-up order and the test container.
1.3. **Requirement refinements:** AC5 now states that each timeout is given in the unit its client expects. It came from checking the claim "timeouts on LiveKit" of the runtime commit: the timeout existed but was 1000 times too long.

---

## 2. Backend Changes

### 2.1. Runtime (commit `feat(app): add createApp`, AC1 to AC6)

| Area | Files | AC |
| :--- | :--- | :--- |
| App factory | `src/main/app.ts`, `src/index.ts`, `src/main/container.ts` | AC1 |
| Logger and request id | `src/core/logging/` (`logger.ts`, `request-context.ts`, `sanitize.ts`), `src/core/middlewares/request-id.middleware.ts`, `error.middleware.ts`, queue producers | AC2 |
| Probes | `src/core/lifecycle/health.route.ts` | AC3 |
| Shutdown | `src/index.ts` | AC4 |
| Configuration and timeouts | `src/config/` (`env.config.ts`, `redis.config.ts`, `mongodb.config.ts`), providers (Groq, Azure audio download, PayOS) | AC5 |
| Container | `Dockerfile`, `pnpm-workspace.yaml`, `.env.example` | AC6 |

### 2.2. Tests and CI (commit `test: add vitest`, AC7, AC8)

2.2.1. `vitest.config.mts` sets the test environment inside the config so that `.env` is never read; `tests/setup.ts`, `tests/helpers/` (in-memory Mongo, in-memory fakes for cache, rate limiter and queues, token helper) and the test files under `tests/api/`, `tests/db/` and `tests/unit/`.
2.2.2. `.github/workflows/ci.yml` runs lint, build, test, `pnpm audit --audit-level=high` and gitleaks.

### 2.3. Health probes behind helmet (commit `fix(app): serve the health probes behind helmet`, AC9)

`src/main/app.ts` order: `requestIdMiddleware`, `helmet()`, health router, `cookieParser()`, `cors()`, `express.json()`. The probes stay before `cors()` and the body parser. Test in `tests/api/http-basics.test.ts`.

### 2.4. Redis log context (commit `fix(redis): create clients outside the request context`, AC10)

`runOutsideRequest(fn)` in `request-context.ts` is `storage.exit(fn)`; `createRedisClient` builds the client inside it. Only the constructor needs it; commands issued by request code keep the request context. Test in `tests/unit/redis-factory.test.ts` mocks `ioredis` with a class that records `getRequestId()` in its constructor.

### 2.5. LiveKit request timeout unit (commit `fix(livekit): pass the request timeout`, AC5)

`LiveKitProvider` passed `env.HTTP_TIMEOUT_MS` (milliseconds) as `requestTimeout` to `RoomServiceClient`, which reads seconds (`AbortSignal.timeout(timeout * 1e3)` in the SDK). It now passes `Math.ceil(env.HTTP_TIMEOUT_MS / 1000)`. The other timeouts were checked and are correct: Groq, PayOS and axios all read milliseconds. Test in `tests/unit/livekit-provider.test.ts` mocks `livekit-server-sdk` and checks the options given to the client.

### 2.6. Shutdown with open Socket.io clients (AC12)

2.6.1. The sequence moves out of `src/index.ts` into `createShutdown` in `src/core/lifecycle/shutdown.ts`, so that it can be tested. It takes the HTTP server, the timeout, `closeSocket`, a `stopBackground` function (workers, then queues, then the database) and an `exit` function (default `process.exit`). `index.ts` only wires it.
2.6.2. Order: ignore repeated calls; arm the forced-exit timer; call `closeSocket()` (Socket.io disconnects its clients and closes the HTTP server); call `server.close(...)` and `server.closeIdleConnections()`; when the server has closed, run `stopBackground`; then log `Shutdown complete` and exit with the requested code. A rejection of `stopBackground` is caught, logged, and exits with code 1 at once.
2.6.3. **Alternatives considered:** (a) *only move `closeSocket()` before `server.close()` inside `index.ts`*: fixes the order but leaves the sequence untestable. (b) *`server.closeAllConnections()`*: also unblocks the server but cuts in-flight HTTP requests, which defeats graceful shutdown.
2.6.4. Tests in `tests/unit/shutdown.test.ts`: with a real HTTP server, a Socket.io server and one WebSocket client the exit code is the requested one and arrives before the timeout; a failing cleanup step exits with 1 before the timeout; repeated calls run cleanup once.

### 2.7. Dockerfile port (AC13)

`ENV APP_PORT=8017` in the runner stage of the `Dockerfile`, matching `EXPOSE 8017` and the `HEALTHCHECK` fallback. `docker-compose.dev.yaml` already sets the same value. No automated test: the image is not built in this environment, so the check is reading the file.

---

## 3. Files of the Fix Commits (AC11)

| File | Change | AC |
| :--- | :--- | :--- |
| `src/core/lifecycle/shutdown.ts` | New: `createShutdown`, Socket.io closed first, cleanup failures caught | AC12 |
| `src/index.ts` | Use `createShutdown` | AC12 |
| `tests/unit/shutdown.test.ts` | New file, three tests | AC12 |
| `Dockerfile` | `ENV APP_PORT=8017` in the runner stage | AC13 |
| `src/modules/voice-room/adapters/livekit.provider.ts` | Convert the timeout to seconds | AC5 |
| `tests/unit/livekit-provider.test.ts` | New file, one test | AC5 |
| `src/main/app.ts` | Reorder as in 2.3 | AC9 |
| `src/core/logging/request-context.ts` | Add `runOutsideRequest` | AC10 |
| `src/core/redis/redis-client.util.ts` | Construct the client inside `runOutsideRequest` | AC10 |
| `tests/api/http-basics.test.ts` | One new test | AC9 |
| `tests/unit/redis-factory.test.ts` | New file, one test | AC10 |

---

## 4. Risks and Rollback

4.1. Only the probes (AC3) have automated tests. Shutdown and timeouts (AC4, AC5) have none. An earlier session checked the probes and a Redis outage by hand against a built app (13 of 14 checks passed, the failing one being the helmet order fixed by AC9); the exit codes on `SIGTERM` and `SIGINT` were never checked.
4.2. Rollback: revert the commits; no data or API is involved.
