# App Foundation: Tasks (Backend)

> Repository: `speprove-be`. Branch: `feat/app-foundation`.
> Requirements: [requirements.md](./requirements.md). Design: [design.md](./design.md).
> Status: **Step 3: Tasks (approved 2026-11-25; implementation and owner checks done; open: task 11 decision, docs follow code after the docs pull request merges)**.
> Evidence column: **test** means an automated test covers it; **code** means it was read in the code only; **none** means no evidence was found.

---

## 1. Runtime (commit `feat(app): add createApp`)

| Done | Task | AC | Evidence |
| :--- | :--- | :--- | :--- |
| [x] | `createApp()`; routes no longer resolve the container at import time | AC1 | test (every API test builds the app with it) |
| [x] | JSON logger, request id in logs, errors and job data, redaction, 5xx always logged | AC2 | test for request id, redaction and error body; code for job data and 5xx |
| [x] | `/health`, `/ready`, `TRUST_PROXY` | AC3 | test |
| [x] | Bounded shutdown, repeated signals ignored, fatal errors exit 1 | AC4 | code; exit codes not checked on this machine |
| [x] | `APP_PORT` default, `REDIS_URL`, Mongo pool and selection timeout, `returnDocument` | AC5 | code |
| [x] | Timeouts on Groq, PayOS and the audio download | AC5 | code |
| [x] | Timeout on LiveKit, in the unit the SDK reads (seconds), see section 3b | AC5 | test (`livekit-provider.test.ts`); the timeout existed in the runtime commit but was 30000 seconds |
| [x] | Third-party keys optional when `NODE_ENV=test` | AC5 | test (the suite runs without them) |
| [x] | Dockerfile `HEALTHCHECK` and workspace file | AC6 | code; the image was not built |

## 2. Tests and CI (commit `test: add vitest`)

| Done | Task | AC | Evidence |
| :--- | :--- | :--- | :--- |
| [x] | Harness: vitest with SWC, supertest, in-memory Mongo replica set, in-memory fakes | AC7 | test (suite green) |
| [x] | 20 tests listed in AC7 | AC7 | test: 20 of 20 pass (2026-11-24) |
| [x] | CI workflow | AC8 | code; **never run on GitHub** |

## 3. Health probes behind helmet (commit `fix(app): serve the health probes behind helmet`)

- [x] 1. Add the header test and see it fail (`x-powered-by: Express` was present) (AC9).
- [x] 2. Reorder the middleware in `src/main/app.ts` (AC9).

## 4. Redis log context (commit `fix(redis): create clients outside the request context`)

- [x] 3. Add the test and see it fail (the constructor saw request id `abc`) (AC10).
- [x] 4. Add `runOutsideRequest` and use it in `createRedisClient` (AC10).

## 3b. LiveKit timeout unit (commit `fix(livekit): pass the request timeout`)

- [x] 3b.1. Add the test and see it fail (`requestTimeout` was 30000, expected 30) (AC5).
- [x] 3b.2. Convert milliseconds to seconds in `LiveKitProvider` (AC5).
- [x] 3b.3. Check the other timeouts: Groq (milliseconds), PayOS (milliseconds), axios audio download (milliseconds) are correct (AC5).

## 3c. Shutdown with open Socket.io clients and the Dockerfile port (review of 2026-11-25)

- [x] 3c.1. Extract the sequence of `src/index.ts` into `createShutdown` with no change of behavior (commit `refactor(app): extract the shutdown sequence`); `tsc` clean and the 23 existing tests stayed green (AC12).
- [x] 3c.2. Add `tests/unit/shutdown.test.ts` and see it fail for the right reasons: with a real WebSocket client no exit within 1.5 s; with a failing cleanup step no exit and an unhandled rejection; the repeated-signal test passed (AC12).
- [x] 3c.3. Fix the order (Socket.io first) and catch failures of the cleanup steps (commit `fix(app): close Socket.io before waiting`); the three tests pass, 8 of 8 repeated runs (AC12).
- [x] 3c.4. `Dockerfile`: `ENV APP_PORT=8017` in the runner stage (commit `fix(docker): set APP_PORT`); checked by reading, the image was not built (AC13).
- [x] 3c.5. Quality gates: 26 of 26 tests, `tsc` and Prettier clean, lint 0 errors and 227 warnings (unchanged), build exit 0; each commit touches only its files (AC11).
- [ ] 3c.6. Owner check: with a browser or client connected to the Socket.io server, Ctrl+C on `node dist/index.js` finishes in about a second and `$LASTEXITCODE` is `0` (AC12).

## 5. Quality Gates (2026-11-25, branch `feat/app-foundation`)

- [x] 5. `pnpm test`: 23 of 23 pass (twice in a row); the three new tests failed before their fixes (AC11). One earlier full run failed `mongo-ping` (flaky under parallel load, requirements 6.1).
- [x] 6. `pnpm lint`: 0 errors, 227 warnings (same as before the fixes); Prettier check passes on the changed files (AC11).
- [x] 7. `pnpm build`: exit code 0, `dist/index.js` created (AC11).
- [x] 8. `git diff --stat` of each fix lists only the files of design section 3 (AC11).

## 6. Manual Check (owner, with the real `.env`)

- [x] 9. `/health` answers 200 with no `x-powered-by`; `/ready` answers 200 (AC3, AC9). Result 2026-11-25 (owner, cloud Mongo and Redis): `/health` 200 `{"status":"ok","uptimeSeconds":65}`, `/ready` 200 `{"status":"ok","dependencies":{"mongo":"ok","redis":"ok"}}`, helmet headers present, no `X-Powered-By`, a new `X-Request-Id` on each response.
- [x] 10. Ctrl+C exits with code 0 (AC4). Result 2026-11-25 (owner, `node dist/index.js`): logged `SIGINT: shutting down`, workers closed, queues closed, Mongo closed, `Shutdown complete` in about 0.1 s, `$LASTEXITCODE` was `0`. The "no request id on Redis client log lines" part (AC10) is covered by `redis-factory.test.ts`, not checked by eye.
- [ ] 11. With Redis stopped, `/ready` answers 503 and `/health` still 200 (AC3). Open: not applicable with a cloud Redis; the 503 behavior is covered by the automated test `GET /ready is 200 when dependencies answer and 503 when one is down`. Proposal: drop this task, owner to confirm.

## 7. Docs Follow Code

- [ ] 12. `AGENTS.md`: replace "There is no test runner" with the vitest setup (`pnpm test`, `tests/`, the first run downloads the MongoDB binary).
- [ ] 13. Document the health probes (`/health`, `/ready`) and the request-id logging in the system overview, in this same pull request.

## 8. Decisions Still Open

- [x] 14. LiveKit timeout: decided (owner) to fix it in this branch; done in commit `fix(livekit): pass the request timeout`.
- [x] 15. `mongo-ping` flake (requirements 6.1): decided (owner) to leave it to the CI ticket.
