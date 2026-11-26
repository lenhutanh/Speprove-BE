# Technical Debt Register

Known weaknesses of the code and the process, how bad each one is, and what is planned. The findings `F1` to `F29` come from the code audit in [section 11 of the architecture refactor design](../specs/architecture-refactor/design.md); the status column says whether each was checked again on the branch this document ships with.

## 1. How to Read It

| Column | Meaning |
| :--- | :--- |
| Impact | `High`: money, security, data loss or a failure users see. `Medium`: wrong behavior in a rare case, or a cost that grows. `Low`: maintainability only |
| Status | `Open (checked)`: re-verified on this branch. `Open`: from the audit, not re-checked. `Fixed`: gone on this branch |
| Plan | The ticket that removes it, named as in [the backlog](./backlog.md). `After defense` means a conscious decision to defer |

1.1. Impact is the author's assessment, not a measurement.
1.2. A pull request that removes an entry deletes its row and says so in its description.

## 2. Correctness and Security

| ID | Debt | Impact | Status | Plan |
| :--- | :--- | :--- | :--- | :--- |
| F2 | The PayOS webhook controller returns `200` for every outcome, so a failed or forged webhook is never retried and is visible only in logs | High | Open (checked) | `fix/webhook-and-http-errors` |
| F13 | Routes that change or list data without a permission check: credit package creation, forecast question import, forecast topic import, all vocabulary suggestion routes, `PUT /voice/:id`; other checks are commented out (`GET /account/me`, forecast list). See the [endpoint index](../08-integration-contracts/03-endpoint-index.md) | High | Open (checked) | `fix/route-permissions` |
| F6 | A foreign resource answers `403` with an explicit message instead of `404`, so a caller can learn which ids exist | Medium | Open | `fix/route-permissions` (`assertOwner`) |
| F7 | Room PIN stored in plain text, compared with `!==`, no limit on attempts | Medium | Open | `refactor/voice-room` |
| F12 | The access token cookie uses `sameSite=none` in production and there is no CSRF defence | Medium | Open (checked) | `refactor/account-auth` |
| F11 | One session per user: signing in on a second device logs out the first | Medium | Open (checked) | `refactor/account-auth` (only if multi-device is wanted) |
| F19 | JWT signed with HS256 and a shared secret | Low | Open | After defense |
| F16 | SSML is built from text without escaping; the class is not used today | Low | Open | `refactor/content-tts-file` |
| F17 | `seed.ts` deletes collections and creates a super admin with a fixed password | High | Open | `chore/seed-split` |
| F3 | The username is the part of the email before `@` and unique, so a second user with the same local part cannot register; `verifyRegister` turns the failure into a `500` | Medium | Open | `fix/webhook-and-http-errors` |
| 2.1 | Registration, OTP verification and forgot password are not rate limited; an OTP has no attempt limit | High | Open (checked) | `refactor/account-auth` |
| 2.2 | Errors thrown without an `errorCode` carry `SYS_001`; `hasPermission` answers `403` with `SYS_001` ([error codes](../08-integration-contracts/02-error-codes.md), section 4) | Medium | Open (checked) | `fix/webhook-and-http-errors` |
| 2.3 | Bull Board has no authentication (only mounted outside production) | Low | Open (checked) | After defense |

## 3. Money and Data Integrity

| ID | Debt | Impact | Status | Plan |
| :--- | :--- | :--- | :--- | :--- |
| F22 | Charge, grant or refund plus the ledger write is copied in six places | High | Open | `refactor/credit-single-path` |
| F5 | A practice charge records the question id as `refId`, not the attempt id | Medium | Open (checked) | `refactor/credit-single-path` |
| F23 | Payment `CANCELED` is never set; `EXPIRED` is set only when someone reads the payment; no job sweeps expired payments | Medium | Open | `refactor/billing-wallet` |
| 3.1 | A scoring failure is refunded only after the user presses retry once; if the user never retries the credit is not refunded and there is no reconciler | Medium | Open (checked) | `fix/demo-path` (reconciler job) |
| F15 | 75 secondary indexes, 8 redundant by prefix, and a duplicate on `Payment.orderCode` | Low | Open | `refactor/content-tts-file` |
| F4 | The "recent sessions" query has no sort | Low | Open | `fix/webhook-and-http-errors` |
| 3.2 | Payment fields `webhookVerified` and `retryCount`, and `CreditLog.descriptionKey` and `descriptionMetadata`, are written or defaulted and never read | Low | Open | `refactor/billing-wallet` |

## 4. Structure and Maintainability

| ID | Debt | Impact | Status | Plan |
| :--- | :--- | :--- | :--- | :--- |
| F1 | About 40 `.populate()` calls reach into another module's collections (55 `populate` lines outside models today) | Medium | Open (checked) | `refactor/module-layout` and the module refactors |
| F8, F9, F28 | Circular dependencies hidden with `delay()`; a service imports another module's model; `account` imports types from `auth` | Medium | Open | module refactors |
| F21 | `SpeakingAnalysisService` has 12 constructor parameters, 7 socket emits and hard-coded provider names | Medium | Open (checked) | `refactor/practice-assessment` |
| F25 | 23 functions over complexity 12, 12 over 70 lines, 8 with more than 5 parameters | Medium | Open | module refactors |
| F20 | Upload runs ffmpeg and two Cloudinary uploads inside the HTTP request; temp names use `Date.now()` | Medium | Open | `refactor/content-tts-file` |
| F24 | `AccountService.getList` reads the model without pagination; `getById` selects `+password` | Medium | Open | `fix/route-permissions` |
| F26 | AI vocabulary extraction costs an LLM call per qualifying attempt and its output is invisible until an admin approves it; no approval screen exists | Low | Open | `refactor/content-tts-file` (put it behind a flag) |
| F10 | Worker concurrency 1 and one queue for all scoring stages | Medium | Open (checked) | After defense |
| 4.1 | 169 uses of `any`, 15 `eslint-disable` or `@ts-ignore`, 211 lint warnings | Medium | Open (checked) | each refactor ticket lowers the count |
| 4.2 | 24 flat modules; the target is ten modules and a `core` ([layout](../specs/architecture-refactor/design.md), section 2) | Medium | Open | `refactor/module-layout` |

## 5. Operations and Process

| ID | Debt | Impact | Status | Plan |
| :--- | :--- | :--- | :--- | :--- |
| 5.1 | The CI workflow has never run on GitHub; the frontend has no CI | High | Open | `ci/quality-gates` |
| 5.2 | No staging environment, no automatic deploy, no rollback, no alert on `/health` | High | Open | `ci-cd-staging` |
| 5.3 | `ROLE=worker` (workers in a separate process) is blocked because `SocketService.emit` does nothing without the in-process server | Medium | Open (checked) | After defense (needs the Socket.io Redis adapter) |
| 5.4 | No coverage report, no duplication figure, no static analysis service | Medium | Open | `ci/quality-gates` |
| 5.5 | The Docker image has not been built and scanned in this environment | Medium | Open | `ci-cd-staging` |
| 5.6 | Acceptance criteria with a test: 12 of 64 ([requirements](../01-introduction/02-requirements.md), section 5) | High | Open | each ticket adds the tests of its criteria |

## 6. Fixed on This Branch

| ID | Debt | How |
| :--- | :--- | :--- |
| F14 | Two files registered the model `ForecastTopic` | The unused duplicate was removed |
| F18 | Swagger globs pointed to missing paths | Swagger was removed |
| F27 | `.env.example` lacked Redis variables | `.env.example` lists every variable |
| F29 | `REDIS_URL` was ignored | The Redis options are built from the URL |
| 6.1 | Dead code, unused imports, the event bus and the `redis` package | Removed in `chore/remove-dead-code` |

## 7. Order of Work

7.1. First the entries that touch money and access (F2, F13, F22, F5), because they are the likeliest to hurt a user.
7.2. Then the process entries (5.1 to 5.4), because they gate delivery and are cheap.
7.3. Then the structure entries, one module at a time, each with the tests of its criteria.
7.4. Entries marked `After defense` are kept here as the roadmap.
