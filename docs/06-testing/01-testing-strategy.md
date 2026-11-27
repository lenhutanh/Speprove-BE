# Testing Strategy

How `speprove-be` is tested, what a change must add, and how a test traces back to a requirement. The end-to-end and API tests that run against a deployed system live in the separate `speprove-testing` repository.

## 1. Principles

1.1. **Test the behavior a client sees.** An API test sends an HTTP request to the real app and checks the status, the `errorCode` and the stored data. It survives a rename, a split or a move, which is why most tests are of this kind.
1.2. **Write the test first.** Add the test, see it fail for the right reason, change the code, see it pass. A test that never failed proves nothing.
1.3. **A bug fix starts with a test that reproduces the bug.** It stays as the regression test.
1.4. **A refactor starts with tests of the current behavior** of the code it touches, so the change can be shown not to alter it.
1.5. **Cover the negative and the edge case**, not only the happy path: missing permission, another user's resource, duplicate request, concurrent request, empty list, expired or already-processed state.
1.6. **Tests never reach a real database or a third-party service.** `vitest.config.mts` sets a throw-away environment and does not read `.env`.

## 2. Layers

| Layer | Folder | What it checks | Speed |
| :--- | :--- | :--- | :--- |
| Unit | `tests/unit` | One function or class with its collaborators faked (shutdown sequence, Redis factory, LiveKit timeout, log sanitizing) | Milliseconds |
| API | `tests/api` | The Express app through `supertest` with an in-memory MongoDB replica set: status, error code, stored data, transactions | Seconds |
| Database | `tests/db` | The in-memory MongoDB harness itself | Seconds |
| End to end and API on a deployed system | `speprove-testing` (Playwright) | Whole flows in a browser and the public API: register, login, practice, upload | Minutes |
| Non-functional | later | Load of the scoring flow (k6 or similar) | Minutes |

## 3. Harness

3.1. Runner: Vitest with SWC (the decorator metadata that `tsyringe` needs). The alias `~` points to `src`.
3.2. `tests/helpers/mongo.ts` starts, resets and stops an in-memory MongoDB replica set (transactions need a replica set).
3.3. `tests/helpers/test-container.ts` (`setupTestContainer`) builds the real DI container and replaces what must not be real: the cache (`MemoryCache`), the rate limiter (allows all) and the queue factory (jobs are accepted and dropped).
3.4. `tests/helpers/tokens.ts` signs test access tokens for a user with chosen permissions.
3.5. `tests/setup.ts` loads `reflect-metadata`.
3.6. The first `pnpm test` downloads a MongoDB binary of several hundred megabytes; later runs reuse it. Set `MONGOMS_DOWNLOAD_DIR` to choose where it goes.

## 4. Writing a Test

4.1. Name the file after the behavior or the module: `tests/api/<area>.test.ts`.
4.2. Name each case as a sentence about behavior: `returns 401 when the token is missing`.
4.3. Build only the data the case needs. Do not depend on the order of tests or on a shared record.
4.4. Assert the status and the `errorCode` of an error, not the message text.
4.5. A concurrency case runs the operation in parallel (`Promise.all`) and checks the invariant afterwards (balance never negative, one ledger row per charge).
4.6. Third-party providers are faked behind their interface. A fake is registered once per file because singletons keep their first dependency.

## 5. What Must Be Tested

| Area | Must have |
| :--- | :--- |
| Credit and payment | Parallel charge, double refund, balance never negative, webhook with bad signature, wrong amount, duplicate and non-pending payment |
| Authentication | Login, wrong password, locked or unverified account, refresh, token reuse, OTP expiry and lockout |
| Authorization | Every route that needs a permission answers `403` without it; another user's resource answers the agreed status |
| Scoring | Band aggregation including half-band rounding; a failed stage refunds once |
| A new endpoint | A success case, a validation failure, an unauthorized case and a forbidden case |

## 6. Traceability

6.1. Every acceptance criterion in a spec (`AC1`, `AC2`, ...) names the test that proves it in the **Evidence** column of `tasks.md` (for example `test: tests/api/credit-and-payment.test.ts`). A criterion proved only by reading code says `code`; one with no proof says `none`.
6.2. A test file does not need to list the criteria; the spec does.
6.3. Defects are tracked as GitHub issues with a severity label. A fixed defect links the commit and the regression test.

## 7. Coverage

7.1. Coverage is measured on the core modules (credit, payment, auth, scoring) and reported by CI. The targets and the current number are in [the baseline](../plan/baseline-2026-11-22.md).
7.2. Coverage finds untested code; it is not a goal by itself. A test written only to raise the number is not accepted.

## 8. Running

```bash
pnpm test              # all tests once
pnpm test:watch        # re-run on change
pnpm test -- tests/api/credit-and-payment.test.ts   # one file
```

8.1. A flaky test is a defect: find the cause. A test that fails only under load (the Mongo ping test did) is isolated, not retried until green.
8.2. The CI workflow (`.github/workflows/ci.yml`) runs lint, build, test, dependency audit and secret scan on every pull request.
