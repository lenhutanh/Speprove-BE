# App Foundation Fixes: Tasks (Backend)

> Repository: `speprove-be`. Branch: `feat/app-foundation`.
> Requirements: [requirements.md](./requirements.md). Design: [design.md](./design.md).
> Status: **Step 3: Tasks (awaiting approval)**

---

## 1. Setup

- [x] 1. `CI=true pnpm install --frozen-lockfile` on Windows, then `pnpm test`: baseline 20 of 20 pass, lint 0 errors and 227 warnings (requirements 2.1.4).

## 2. Tests first

- [ ] 2. `tests/api/http-basics.test.ts`: add the header test; run it and see it **fail** (AC1).
- [ ] 3. `tests/unit/redis-factory.test.ts`: add the test; run it and see it **fail** (AC2).

## 3. Code

- [ ] 4. `src/app.ts`: reorder the middleware (AC1).
- [ ] 5. `src/infrastructure/logging/request-context.ts`: add `runOutsideRequest` (AC2).
- [ ] 6. `src/infrastructure/redis/redis.factory.ts`: construct the client inside `runOutsideRequest` (AC2).

## 4. Quality Gates

- [ ] 7. Re-run both new tests: they **pass** (AC1, AC2).
- [ ] 8. `pnpm lint && pnpm build && pnpm test`: 0 lint errors, build green, 22 tests pass (AC3).
- [ ] 9. `git diff --stat` lists only the files of design section 3 and, after tasks 12 and 13, `AGENTS.md` and the system overview (AC4).

## 5. Manual Check (owner, with the real `.env`)

- [ ] 10. `node dist/index.js`: `/health` answers 200 with no `x-powered-by`; `/ready` answers 200.
- [ ] 11. Ctrl+C exits with code 0 (`echo $?`); the Redis client log lines carry no request id.

## 6. Docs follow code

- [ ] 12. `AGENTS.md`: replace "There is no test runner" with the vitest setup (`pnpm test`, `tests/`, the first run downloads the MongoDB binary).
- [ ] 13. Document the health probes (`/health`, `/ready`) and the request-id logging in the system overview, in this same pull request (the `project-docs` ticket deliberately leaves them out).
