# App Foundation: Tasks (Backend)

> Repository: `speprove-be`. Branch: `feat/app-foundation`.
> Requirements: [requirements.md](./requirements.md). Design: [design.md](./design.md).
> Status: **Step 3: Tasks (approved 2026-11-25; implementation done except the owner checks and docs follow code)**.
> Evidence column: **test** means an automated test covers it; **code** means it was read in the code only; **none** means no evidence was found.

---

## 1. Runtime (commit `3db0e35`)

| Done | Task | AC | Evidence |
| :--- | :--- | :--- | :--- |
| [x] | `createApp()`; routes no longer resolve the container at import time | AC1 | test (every API test builds the app with it) |
| [x] | JSON logger, request id in logs, errors and job data, redaction, 5xx always logged | AC2 | test for request id, redaction and error body; code for job data and 5xx |
| [x] | `/health`, `/ready`, `TRUST_PROXY` | AC3 | test |
| [x] | Bounded shutdown, repeated signals ignored, fatal errors exit 1 | AC4 | code; exit codes not checked on this machine |
| [x] | `APP_PORT` default, `REDIS_URL`, Mongo pool and selection timeout, `returnDocument` | AC5 | code |
| [x] | Timeouts on Groq, PayOS and the audio download | AC5 | code |
| [x] | Timeout on LiveKit, in the unit the SDK reads (seconds), see section 3b | AC5 | test (`livekit-service.test.ts`); the timeout existed in the runtime commit but was 30000 seconds |
| [x] | Third-party keys optional when `NODE_ENV=test` | AC5 | test (the suite runs without them) |
| [x] | Dockerfile `HEALTHCHECK` and workspace file | AC6 | code; the image was not built |

## 2. Tests and CI (commit `42fb4fc`)

| Done | Task | AC | Evidence |
| :--- | :--- | :--- | :--- |
| [x] | Harness: vitest with SWC, supertest, in-memory Mongo replica set, in-memory fakes | AC7 | test (suite green) |
| [x] | 20 tests listed in AC7 | AC7 | test: 20 of 20 pass (2026-11-24) |
| [x] | CI workflow | AC8 | code; **never run on GitHub** |

## 3. Health probes behind helmet (commit `d224a36`)

- [x] 1. Add the header test and see it fail (`x-powered-by: Express` was present) (AC9).
- [x] 2. Reorder the middleware in `src/app.ts` (AC9).

## 4. Redis log context (commit `67f0af5`)

- [x] 3. Add the test and see it fail (the constructor saw request id `abc`) (AC10).
- [x] 4. Add `runOutsideRequest` and use it in `createRedisClient` (AC10).

## 3b. LiveKit timeout unit (commit `252b414`)

- [x] 3b.1. Add the test and see it fail (`requestTimeout` was 30000, expected 30) (AC5).
- [x] 3b.2. Convert milliseconds to seconds in `LiveKitService` (AC5).
- [x] 3b.3. Check the other timeouts: Groq (milliseconds), PayOS (milliseconds), axios audio download (milliseconds) are correct (AC5).

## 5. Quality Gates (2026-11-25, branch `feat/app-foundation`)

- [x] 5. `pnpm test`: 23 of 23 pass (twice in a row); the three new tests failed before their fixes (AC11). One earlier full run failed `mongo-ping` (flaky under parallel load, requirements 6.1).
- [x] 6. `pnpm lint`: 0 errors, 227 warnings (same as before the fixes); Prettier check passes on the changed files (AC11).
- [x] 7. `pnpm build`: exit code 0, `dist/index.js` created (AC11).
- [x] 8. `git diff --stat` of each fix lists only the files of design section 3 (AC11).

## 6. Manual Check (owner, with the real `.env`)

- [ ] 9. `node dist/index.js`: `/health` answers 200 with no `x-powered-by`; `/ready` answers 200 (AC3, AC9).
- [ ] 10. Ctrl+C exits with code 0 (`echo $?`); the Redis client log lines carry no request id (AC4, AC10).
- [ ] 11. With Redis stopped, `/ready` answers 503 and `/health` still 200; after restarting Redis, `/ready` answers 200 again (AC3).

## 7. Docs Follow Code

- [ ] 12. `AGENTS.md`: replace "There is no test runner" with the vitest setup (`pnpm test`, `tests/`, the first run downloads the MongoDB binary).
- [ ] 13. Document the health probes (`/health`, `/ready`) and the request-id logging in the system overview, in this same pull request.

## 8. Decisions Still Open

- [x] 14. LiveKit timeout: decided (owner) to fix it in this branch; done in commit `252b414`.
- [x] 15. `mongo-ping` flake (requirements 6.1): decided (owner) to leave it to the CI ticket.
