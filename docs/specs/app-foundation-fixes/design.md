# App Foundation Fixes: Design (Backend)

> Repository: `speprove-be`. Branch: `feat/app-foundation`.
> Requirements: [requirements.md](./requirements.md) (AC1 to AC4).
> Status: **Step 2: Design (awaiting approval)**

---

## 1. Overview

1.1. **Approach:** two small, independent code changes plus two tests. No new dependency, no API change, no data change.
1.2. **Alternatives considered:**
1.2.1. *`app.disable('x-powered-by')` instead of reordering.* Rejected: it hides one header only; the probes would still lack the other helmet headers (AC1).
1.2.2. *`AsyncLocalStorage.enterWith(undefined)` before creating the client.* Rejected: `enterWith` changes the context of the current execution for everything that follows, including the rest of the request. `exit(fn)` scopes the change to `fn`.
1.2.3. *Create the Redis clients at boot instead of lazily.* Rejected for this ticket: it changes the start-up order and the test container; the context fix is smaller and local to the factory.
1.3. **Requirement refinements:** none.

---

## 2. Backend Changes

### 2.1. `src/app.ts` (AC1)

Order: `requestIdMiddleware`, `helmet()`, `createHealthRouter(...)`, `cookieParser()`, `cors()`, `express.json()`. The health router stays before `cors()` and `express.json()` so probes need neither.

### 2.2. `src/infrastructure/logging/request-context.ts` (AC2)

```ts
export const runOutsideRequest = <T>(fn: () => T): T => storage.exit(fn)
```

### 2.3. `src/infrastructure/redis/redis.factory.ts` (AC2)

```ts
const client = runOutsideRequest(() => new Redis(getRedisOptions(name)))
```

Only the constructor needs it. Commands issued by request code keep the request context, so their errors still carry the right request id. `getRedisOptions` is a pure function of `env` (`redis.config.ts`), so the unit test does not need to mock it.

### 2.4. Tests

2.4.1. `tests/api/http-basics.test.ts`: request `/health`; expect no `x-powered-by` and `x-content-type-options` equal to `nosniff` (AC1).
2.4.2. `tests/unit/redis-factory.test.ts` (new): `vi.mock('ioredis')` with a class whose constructor stores `getRequestId()`; call `createRedisClient('x')` inside `runWithRequestId('abc', ...)`; expect the stored value to be `undefined` (AC2).

---

## 3. Files

| File | Change | AC |
| :--- | :--- | :--- |
| `src/app.ts` | Reorder as in 2.1 | AC1 |
| `src/infrastructure/logging/request-context.ts` | Add `runOutsideRequest` | AC2 |
| `src/infrastructure/redis/redis.factory.ts` | Construct the client inside `runOutsideRequest` | AC2 |
| `tests/api/http-basics.test.ts` | One new test | AC1 |
| `tests/unit/redis-factory.test.ts` | New file, one test | AC2 |

---

## 4. Risks and Rollback

4.1. `AsyncLocalStorage.exit` is a standard Node API, not yet run on this machine's Node 24.12.0 (the unit test will prove it).
4.2. Rollback: revert the commit; no data or API is involved.
