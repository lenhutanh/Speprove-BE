# App Foundation Fixes: Requirements (Backend)

> Repository: `speprove-be`. Branch: `feat/app-foundation` (existing, local only).
> Epic: E1 (see [backlog](../../plan/backlog.md)); handoff open items 1 and 2 ([handoff](../../plan/handoff.md)).
> Status: **Step 1: Requirements (awaiting approval)**

---

## 1. Goal

Finish the two open items of the foundation ticket so the branch can be pushed and reviewed: the health probes get the security headers of `helmet()`, and the Redis clients stop inheriting the request id of the request that happened to create them.

---

## 2. Context

### 2.1. Current State

2.1.1. `src/app.ts` mounts `createHealthRouter(...)` at line 22 and `helmet()` at line 24. Requests to `/health` and `/ready` therefore never pass through `helmet()`: they carry no helmet headers and still answer `X-Powered-By: Express`.
2.1.2. `src/infrastructure/logging/logger.ts` reads `getRequestId()` (an `AsyncLocalStorage` lookup, `request-context.ts`) on every log call.
2.1.3. `createRedisClient` (`src/infrastructure/redis/redis.factory.ts`) calls `new Redis(...)`. It is used by `CacheService`, `QueueFactory` and `RateLimiterService`, which are singletons resolved the first time they are needed, normally inside a request. ioredis opens its socket in the constructor, so the socket inherits the async context of that request. Later events (`connect`, `error`, reconnects) are then logged with the request id of that first request.
2.1.4. Baseline measured on 2026-11-24 after `pnpm install --frozen-lockfile` on Windows (Node 24.12.0): `pnpm test` 20 of 20 pass (5 files); `pnpm lint` 0 errors and 227 warnings; `pnpm build` not yet run.
2.1.5. On the first run `tests/db/mongo-ping.test.ts` failed with a 30 s timeout while mongodb-memory-server downloaded its 781 MB binary (the test calls `startMongo()` inside the test body, so `hookTimeout` does not apply). The second run passed with the binary cached.

### 2.2. Decisions

2.2.1. Both fixes stay on `feat/app-foundation`, inside the runtime commit's boundary.
2.2.2. The tests live in the same pull request as the code they verify. The harness of `42fb4fc` imports `createApp` from the runtime commit, so the branch is not split (**decided by the owner**).

---

## 3. User Stories

3.1. As an **operator**, I want `/health` and `/ready` to carry the same security headers as every other route and not to advertise the framework, so that probes do not weaken the hardening.
3.2. As a **developer reading logs**, I want a Redis connection log line to carry no request id, or the right one, so that I never follow a trace of an unrelated request.

---

## 4. Acceptance Criteria

- **AC1.** `GET /health` and `GET /ready` have no `x-powered-by` header and have `x-content-type-options: nosniff`.
- **AC2.** A Redis client created inside `runWithRequestId('abc', ...)` is constructed with no request id in its async context.
- **AC3.** No regression: `pnpm lint`, `pnpm build` and `pnpm test` pass, with exactly two more tests than the baseline (22), and no existing test changes status.
- **AC4.** The diff touches only the files listed in `design.md` section 3, plus `CLAUDE.md` and the system overview document (docs follow code, tasks 12 and 13).

---

## 5. Out of Scope

5.1. `/ready` logic and health check content.
5.2. `ROLE=worker`: blocked until Socket.io can be reached from another process (backlog E1).
5.3. BullMQ's own internal connection duplication.
5.4. Redis error log format.
5.5. The duplicate `Payment.orderCode` index warning (backlog E2).

---

## 6. Open Questions

6.1. Should the `mongo-ping` test be fixed in this pull request (move `startMongo()` into `beforeAll`) or left to the CI ticket? It is outside AC1 to AC4. Recommendation: the CI ticket, where a cache miss is the real risk.
