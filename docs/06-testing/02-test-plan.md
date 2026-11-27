# Test Plan

What is tested, at which level, by which test, and what must be added. The user stories and acceptance criteria (AC) are in [the requirements](../01-introduction/02-requirements.md); the way tests are written is in [the testing strategy](./01-testing-strategy.md).

## 1. Objectives

1.1. Every acceptance criterion has at least one automated test or a written manual check.
1.2. The flows that move money, scores or access (credit, payment, authentication, permissions, scoring) have negative and edge cases, not only the success path.
1.3. A regression is caught before merge: CI runs the whole suite on every pull request.

## 2. Levels and Tools

| Level | Repository and folder | Tool | Scope |
| :--- | :--- | :--- | :--- |
| Unit | `speprove-be/tests/unit` | Vitest | Pure logic and small classes with fakes |
| API | `speprove-be/tests/api` | Vitest, supertest, in-memory MongoDB replica set | The Express app with the real DI container; cache, rate limiter and queues faked |
| Deployed API | `speprove-testing/automation/api` | Playwright API tests | Register, login, attempt, file and practice against a running system |
| End to end | `speprove-testing/automation/e2e` | Playwright with page objects | Register, login and practice in a browser |
| Non-functional | later | A load tool | Concurrent scoring and payment webhooks |

2.1. A criterion is proved at the lowest level that can prove it. A browser test is used only for what a lower level cannot show.

## 3. Entry and Exit Criteria

| | Criteria |
| :--- | :--- |
| Entry (start testing a change) | The change builds, lints, and its acceptance criteria are written |
| Exit (merge) | `pnpm lint`, `pnpm build` and `pnpm test` pass in CI; the change has tests for its criteria; no open defect of severity critical or blocker is introduced |
| Release to staging | The merged `main` is green and the deploy health check passes |

## 4. Traceability

`Existing` is a test that exists today. `To add` is the test that closes the gap; its folder is `speprove-be/tests/api` unless stated.

| User story | Existing | To add | Priority |
| :--- | :--- | :--- | :--- |
| US-01 Register | Playwright register spec (`speprove-testing`) | `auth-register.test.ts`: existing email 409, OTP right, wrong, expired, free credits and credit log (AC-01.1 to 01.5) | High |
| US-02 Sign in | `auth-login.test.ts` (3 cases) | `auth-session.test.ts`: locked account, refresh rotation, token reuse revokes the session, logout (AC-02.4 to 02.7); the limiter is tested with the real limiter and a fake Redis | High |
| US-03 Google sign-in | none | `auth-google.test.ts` with a fake Google service: bad state, unverified email, first sign-in creates the account | Medium |
| US-04 Password | none | `auth-password.test.ts`: forgot and reset flow, change password | Medium |
| US-05 Browse | none | `content.test.ts`: list, filter, search, 404 | Medium |
| US-06 Question audio | none | `question-audio.test.ts` with a fake text-to-speech provider: generated once, reused | Low |
| US-07 Practice | `credit-and-payment.test.ts` (parallel deduction) | `practice-attempt.test.ts`: charge, insufficient balance, stage progression with fake providers, retry, refund once, submit twice | **Critical** |
| US-08 Mock test | none | `mock-session.test.ts`: charge once, current question, session band and rounding, failure, retry, whole-session refund | **Critical** |
| US-09 Result | none | `attempt-result.test.ts`: scores returned, another user's attempt refused, word audio owner only | High |
| US-10 Share and leaderboard | none | `attempt-share.test.ts`: owner only, `DONE` only, leaderboard limited to public `DONE` attempts | Medium |
| US-11 Profile | none | `account-profile.test.ts`: allowed fields only; upload rules in `file-upload.test.ts` | Medium |
| US-12 Credit history | none | `credit-log.test.ts`: own rows only, balance arithmetic of each row | High |
| US-13 Payment | `credit-and-payment.test.ts` (webhook twice, wrong amount) | `payment-webhook.test.ts`: bad signature, non-pending payment, expiry; `payment-create.test.ts`: reuse of a pending payment | **Critical** |
| US-14 Voice rooms | none | `voice-room.test.ts`: list, create, join, PIN, host-only actions with a fake LiveKit | Medium |
| US-15 Administration | `http-basics.test.ts` (403 without permission) | `permissions.test.ts`: walks every route of the [endpoint index](../08-integration-contracts/03-endpoint-index.md) and checks `403` without the listed permission and `401` without a token | **Critical** |
| US-16 Operation | `http-basics.test.ts`, `shutdown.test.ts`, `mongo-ping.test.ts`, `sanitize.test.ts` | none | Done |

4.1. **Critical** rows are done first: they protect money, scores and access.
4.2. The route-walking test in `permissions.test.ts` reads the route list from the Express router, so a new route without a check fails the test.
4.3. The `speprove-testing` specs run against a deployed environment and supplement, not replace, the backend tests.

## 5. Test Data

5.1. Each test creates the accounts, groups and payments it needs (see `createAccount` in `credit-and-payment.test.ts`) and does not depend on another test.
5.2. Third-party providers (Groq, Azure, PayOS, Brevo, Cloudinary, LiveKit, Google) are faked behind their interfaces. No test calls a real provider.
5.3. The seed script is never run by a test.

## 6. Coverage

6.1. Target: line coverage of the core modules (credit, payment, authentication, scoring) of at least 50 percent, 70 percent as a stretch. CI publishes the report.
6.2. Measured on 2026-11-26: 22.03 percent of the lines of `src/`, about 20.4 percent for the core modules (payment 51.2, credit-log 51.4, auth 23.4, account 38.7, attempt 8.6, speaking-session 11.8). The detail is in [the baseline](../plan/baseline-2026-11-22.md).

## 7. Defects

7.1. A defect is a GitHub issue with a severity label: `critical` (money, data loss or security), `major` (a feature does not work), `minor` (cosmetic or workaround exists).
7.2. Life cycle: opened, confirmed with steps to reproduce, fixed in a pull request that links the issue, verified by a regression test that fails before the fix, closed.
7.3. A fixed defect always leaves a test behind ([testing strategy](./01-testing-strategy.md), section 1.3).
7.4. Known defects that are not fixed yet are listed in the [technical debt register](../plan/technical-debt.md).

## 8. Reporting

8.1. CI reports pass or fail and the coverage number on every pull request.
8.2. At the end of a phase the number of acceptance criteria with a test is recounted from [the requirements](../01-introduction/02-requirements.md), section 5.
