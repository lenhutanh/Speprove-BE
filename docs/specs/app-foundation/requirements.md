# App Foundation: Requirements (Backend)

> Repository: `speprove-be`. Branch: `feat/app-foundation` (local only, 4 commits).
> Epic: E1 of the [backlog](../../plan/backlog.md); step R0 of the [architecture refactor design](../architecture-refactor/design.md).
> Status: **Step 1: Requirements (awaiting approval)**.
> Note: the first two commits (`3db0e35`, `42fb4fc`) were implemented before this spec existed. AC1 to AC8 were reconstructed from their commit messages, the backlog and the code; `tasks.md` records which of them have evidence and which do not.

---

## 1. Goal

Give the backend a runtime that can be operated and observed (health probes, request-scoped logs, bounded shutdown, timeouts, honest configuration) and a small automated safety net (tests and CI), so that the refactor that follows can be verified.

---

## 2. Context

### 2.1. Current State Before the Branch

2.1.1. The Express app was built at import time, and route files resolved the DI container at import time.
2.1.2. Logging was 76 `console.*` calls plus two unused logger classes; there was no request id.
2.1.3. There was no liveness or readiness endpoint, and shutdown had no time limit.
2.1.4. There were no timeouts on the calls to Groq, PayOS, LiveKit and the audio download.
2.1.5. `REDIS_URL` was ignored (finding F29 of the refactor design), and the default of `APP_PORT` did not match the Docker port.
2.1.6. The Dockerfile had no `HEALTHCHECK`.
2.1.7. The repository had no automated test and no CI for the backend.

### 2.2. Decisions

2.2.1. All four commits stay in one pull request, because the tests need `createApp` from the runtime commit and a test belongs with the code it verifies (**decided by the owner**).
2.2.2. The two last commits fix problems found when the first one was checked: the health probes were mounted before `helmet()`, and Redis clients kept the request id of the request that created them.

---

## 3. User Stories

3.1. As an **operator**, I want liveness and readiness endpoints, bounded shutdown and request ids in every log line, so that I can run and diagnose the service.
3.2. As a **developer**, I want an app factory and a fast test harness, so that I can verify a change without real databases or third-party services.
3.3. As a **reviewer**, I want CI to run lint, build, tests and a dependency and secret scan on every pull request.

---

## 4. Acceptance Criteria

- **AC1.** `createApp()` in `src/app.ts` builds the Express app without listening, and route files do not resolve the DI container at import time.
- **AC2.** One JSON logger writes to stdout. Every line logged inside a request carries its `requestId`. Sensitive keys are redacted, also in `toJSON` output. A valid `X-Request-Id` header is kept and returned, otherwise one is generated; the id appears in error response bodies and in BullMQ job data. Responses of status 5xx are always logged.
- **AC3.** `GET /health` answers 200 without touching a dependency. `GET /ready` answers 200 when Mongo and Redis answer and 503 otherwise, with the status of each dependency; Mongo counts as down until connected. `trust proxy` comes from `TRUST_PROXY`.
- **AC4.** On `SIGINT` or `SIGTERM` the process shuts down gracefully and exits with code 0; repeated signals are ignored; the process exits by force after `SHUTDOWN_TIMEOUT_MS`. `unhandledRejection` and `uncaughtException` shut down gracefully and exit with code 1.
- **AC5.** Configuration: the default of `APP_PORT` matches the Docker port; `REDIS_URL` is honored; the calls to Groq (speech to text and LLM), PayOS, LiveKit and the audio download have timeouts read from `HTTP_TIMEOUT_MS` or `AI_TIMEOUT_MS`; Mongo has a pool size and a server selection timeout; third-party keys are optional when `NODE_ENV=test`; the deprecated `new` option of `findOneAndUpdate` is replaced by `returnDocument`.
- **AC6.** The Dockerfile has a `HEALTHCHECK` (reading `PORT`, then `APP_PORT`) and copies `pnpm-workspace.yaml`.
- **AC7.** A test harness (vitest with SWC, supertest, in-memory MongoDB replica set) runs 20 tests: health and readiness, request id, 401, 403 and 404 responses, login (four cases), parallel credit deductions never go below zero, a webhook delivered several times credits once, a webhook with a wrong amount is ignored, log sanitizing, and the Mongo readiness check. Redis-backed pieces (cache, rate limiter, queues) are replaced by in-memory fakes, and tests never read `.env`.
- **AC8.** A CI workflow runs lint, build, test, `pnpm audit --audit-level=high` and gitleaks on pull requests and on pushes to `main`.
- **AC9.** `GET /health` and `GET /ready` have no `x-powered-by` header and have `x-content-type-options: nosniff`.
- **AC10.** A Redis client created inside `runWithRequestId('abc', ...)` is constructed with no request id in its async context.
- **AC11.** Quality gates: `pnpm lint` has 0 errors, `pnpm build` succeeds, `pnpm test` passes in full (22 tests), and the diff of the last two commits touches only the files of `design.md` section 3.

---

## 5. Out of Scope

5.1. `ROLE=api|worker` and a separate worker process: blocked because `SocketService.emit` does nothing without the in-process Socket.io server (backlog E1).
5.2. Splitting the configuration file by concern.
5.3. A test for submitting a practice answer twice (needs the queue and attempt flow).
5.4. Timeouts for the Azure Speech SDK recognizer and the Brevo and Cloudinary SDKs.
5.5. `dependency-cruiser` (moves to the module layout work).
5.6. The duplicate `Payment.orderCode` index warning (backlog E2).

---

## 6. Open Questions

6.1. Should the `mongo-ping` test be fixed in this pull request (move `startMongo()` into `beforeAll`)? On the first run it failed with a 30 s timeout while the 781 MB MongoDB binary was downloading. Recommendation: leave it to the CI ticket, where a cache miss is the real risk.
