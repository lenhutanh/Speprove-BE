# Non-Functional Requirements

Quality targets with a number and a way to check each. **Implemented** is a limit that already exists in the code (so it is true today). **Proposed target** is what the product should meet; the owner confirms or changes the number, and a target is not a claim until it is measured. **Measured** stays empty until a measurement exists.

## 1. How to Read It

1.1. Each requirement has an ID (`NFR-xx`), a metric, an implemented limit when there is one, a proposed target, and how it is measured.
1.2. A measurement is recorded in [the baseline](../plan/baseline-2026-11-22.md) with the date, the environment and the tool.

## 2. Performance

| ID | Metric | Implemented | Proposed target | Measured | How |
| :--- | :--- | :--- | :--- | :--- | :--- |
| NFR-01 | Response time of read endpoints (content, history), 95th percentile | none | at most 500 ms at 20 concurrent users | | Load tool against staging |
| NFR-02 | Time from submitting a practice answer to a finished score | per-call timeouts: 60 s for each AI call, 30 s for other HTTP calls | at most 60 s for an answer of up to 1 minute of speech | | Timestamps `analysisMeta.startedAt` and `finishedAt` of attempts on staging |
| NFR-03 | Page size of a list | at most 100 items | at most 100 items | n/a | Validation schema (`limit` up to 100) |
| NFR-04 | Time to stop the service on a shutdown signal | at most 15 s (`SHUTDOWN_TIMEOUT_MS`) | at most 15 s | test: `tests/unit/shutdown.test.ts` | Unit test |

## 3. Capacity and Concurrency

| ID | Metric | Implemented | Proposed target | Measured | How |
| :--- | :--- | :--- | :--- | :--- | :--- |
| NFR-05 | Concurrent scoring jobs | one job at a time per queue (worker concurrency 1) | 10 answers submitted within one minute are all scored within 5 minutes | | Load script that submits answers with fake providers |
| NFR-06 | Parallel charges against one balance | the balance never goes below zero (conditional update in a transaction) | 0 negative balances in 100 parallel charges | test: `tests/api/credit-and-payment.test.ts` (parallel deductions) | Concurrency test |
| NFR-07 | Voice room size | 2 to 10 participants per room | 2 to 10 participants per room | n/a | Model validation |

## 4. Security

| ID | Metric | Implemented | Proposed target | Measured | How |
| :--- | :--- | :--- | :--- | :--- | :--- |
| NFR-08 | Secrets in the repository and its history | secret scan in CI (gitleaks) | 0 findings | | CI report |
| NFR-09 | Known vulnerable dependencies | `pnpm audit --audit-level=high` in CI | 0 high or critical | 0 high or critical, 1 moderate in development tooling on 2026-11-26 | CI step |
| NFR-10 | Password storage | bcrypt hash, field not selected by default | bcrypt hash | n/a | Code review |
| NFR-11 | Login brute force | 3 attempts per 10 s per user or IP; OTP has no attempt limit | 5 wrong OTP attempts lock the code | | API test with the real limiter |
| NFR-12 | Token lifetime | set by `ACCESS_TOKEN_LIFE`, `REFRESH_TOKEN_LIFE` | access token at most 15 minutes | | Configuration review |
| NFR-13 | Routes that change data without a permission check | 9 routes ([endpoint index](../08-integration-contracts/03-endpoint-index.md)) | 0 | | The route-walking test |
| NFR-14 | Security headers on every response | `helmet()` | present on every response including probes | test: `tests/api/http-basics.test.ts` | API test |

## 5. Reliability and Operation

| ID | Metric | Implemented | Proposed target | Measured | How |
| :--- | :--- | :--- | :--- | :--- | :--- |
| NFR-15 | Liveness and readiness | `/health` and `/ready` (503 when MongoDB or Redis is down) | both answer within 1 s | test: `tests/api/http-basics.test.ts` | API test |
| NFR-16 | Retries of failed work | scoring stages 3 attempts with exponential backoff; mail 5 attempts | unchanged | n/a | Queue configuration |
| NFR-17 | Credit refunded after a scoring failure | once, after one manual retry | 0 duplicated refunds in 100 repeated failures | | Concurrency test |
| NFR-18 | Traceability of a request | a request id on every log line and error body, carried into jobs | 100 percent of error responses carry `requestId` | test: `tests/api/http-basics.test.ts` | API test |
| NFR-19 | Time from commit to running on staging | no pipeline | at most 15 minutes | | Pipeline run history |
| NFR-20 | Successful pipeline runs | CI has not run on GitHub | at least 90 percent green over the period | | Pipeline run history |

## 6. Maintainability

| ID | Metric | Implemented | Proposed target | Measured | How |
| :--- | :--- | :--- | :--- | :--- | :--- |
| NFR-21 | Lint errors | 0 errors, 211 warnings | 0 errors, no new warning | 2026-11-26 | `pnpm lint` |
| NFR-22 | Code duplication | not measured before | at most 5 percent | 1.11 percent on 2026-11-26 (`jscpd`, 15 clones) | `jscpd` or the static analysis service |
| NFR-23 | Blocker or critical static-analysis issues | not measured | at most 2 | | The static analysis service |
| NFR-24 | Line coverage of the core modules | report available (`pnpm test:coverage`) | at least 50 percent | 20.4 percent on 2026-11-26 (22.03 percent for the whole of `src/`) | `pnpm test:coverage` in CI |
| NFR-25 | Acceptance criteria with an automated test | 12 of 64 | at least 70 percent of the critical ones | 2026-11-26 | [Requirements](./02-requirements.md), section 5 |

## 7. Usability and Compatibility

| ID | Metric | Implemented | Proposed target | Measured | How |
| :--- | :--- | :--- | :--- | :--- | :--- |
| NFR-26 | Task completion by new users | | at least 80 percent | | User testing with a written scenario |
| NFR-27 | Perceived usability (SUS) | | at least 68 | | User testing questionnaire |
| NFR-28 | Supported runtime | Node version in `.nvmrc`, MongoDB replica set, Redis | unchanged | n/a | [Local setup](../02-getting-started/01-setup-local-env.md) |

7.1. The usability numbers are filled by the user testing run by the product owner; the backend only provides the staging environment.
