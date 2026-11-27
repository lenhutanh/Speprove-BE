# Requirements

What Speprove must do, for whom, and how each statement is checked. Every user story has acceptance criteria (AC) that can be observed from outside the system. The **Evidence** column says how an AC is proved today: `test` (an automated test, named), `code` (read in the code only) or `none` (no proof yet). The test plan that groups them is in [02-test-plan.md](../06-testing/02-test-plan.md).

## 1. Purpose and Scope

1.1. Speprove is a platform where an IELTS Speaking candidate practices answers, takes mock tests and gets a band score with feedback from an automated pipeline.
1.2. **In scope of this document:** accounts and sign-in, forecast content, practice, mock test and scoring, results and sharing, credit and payment, voice rooms, administration.
1.3. **Out of scope today:** one-to-one chat, friends and calls (planned), native mobile apps, a human teacher marking workflow.

## 2. Actors

| Actor | Description |
| :--- | :--- |
| Guest | Not signed in. Can read public content and the leaderboard |
| Learner | A signed-in account of group `USER`. Practices, takes tests, pays |
| Administrator | A signed-in account of group `ADMIN` with permissions to manage content, groups and permissions |
| PayOS | Payment provider that calls the webhook |
| Speech and language providers | Groq (speech to text, LLM) and Azure (pronunciation); external |

## 3. Business Rules

| ID | Rule | Source |
| :--- | :--- | :--- |
| BR-01 | A new account has 50 free credits (`FREE_SIGNUP_BALANCE`) recorded in the credit log | `account.constants.ts` |
| BR-02 | Practice costs 5 credits for Part 1, 20 for Part 2, 10 for Part 3 | `CREDIT_COST.PRACTICE` |
| BR-03 | A mock test is charged once at creation: 40 (Part 1), 20 (Part 2), 50 (Part 3) or 100 (full test); its attempts are not charged again | `CREDIT_COST.MOCK`, `FULL_TEST` |
| BR-04 | The balance never goes below zero; a charge with too little balance fails with `INSUFFICIENT_BALANCE` and creates nothing | `AccountRepository.deductBalance` |
| BR-05 | Every balance change writes a credit log row in the same transaction, with the balance before and after | [payment and credit](../04-business-logic/02-payment-and-credit.md) |
| BR-06 | A payment link expires 15 minutes after creation; an unpaid payment becomes `EXPIRED` when it is next read | payment flow |
| BR-07 | A payment webhook grants credit once: the signature must be valid, the payment `PENDING` and the amount equal to the order | payment flow |
| BR-08 | A failed scoring can be retried by the user once; credit is refunded automatically only when scoring still fails after that retry, and only once | [AI scoring](../04-business-logic/01-ai-scoring.md) |
| BR-09 | A mock test band is the mean of the four criteria, each averaged per part and rounded to the nearest 0.5 | AI scoring |
| BR-10 | Only a finished (`DONE`) attempt can be shared, and only by its owner | `AttemptService.toggleShareStatus` |
| BR-11 | A user has one active session; signing in on another device ends the older one | [authentication](../03-architecture/02-authentication.md) |
| BR-12 | An OTP is valid for 180 seconds; a pending registration for 300 seconds | `CACHE_CONFIG` |

## 4. User Stories and Acceptance Criteria

### 4.1. Accounts

**US-01.** As a guest, I want to register with my email and verify it with a code, so that I can start practicing.

| AC | Criterion | Evidence |
| :--- | :--- | :--- |
| AC-01.1 | `POST /auth/register` with a valid email and matching passwords sends an OTP email and creates no account yet | none |
| AC-01.2 | Registering an email that already has an account is refused with `409` | none |
| AC-01.3 | `POST /auth/verify-register` with the right OTP within 180 seconds creates an active account with 50 credits and a credit log row (BR-01) | none |
| AC-01.4 | A wrong or expired OTP, or an expired registration, creates no account | none |
| AC-01.5 | A body that fails validation answers `422` with `REQ_001` and the field messages | none |

**US-02.** As a learner, I want to sign in with my email and password and stay signed in, so that I do not retype my password.

| AC | Criterion | Evidence |
| :--- | :--- | :--- |
| AC-02.1 | The right credentials set the `accessToken` and `refreshToken` cookies and return the account | test: `tests/api/auth-login.test.ts` (signs a user in with the right password) |
| AC-02.2 | A wrong password and an unknown email give the same `401` answer | test: `tests/api/auth-login.test.ts` |
| AC-02.3 | An invalid body answers `422` | test: `tests/api/auth-login.test.ts` |
| AC-02.4 | More than 3 login attempts in 10 seconds answer `429` | none (the limiter is replaced in tests) |
| AC-02.5 | A locked or deleted account cannot sign in (`403`, `ACC_002`) | none |
| AC-02.6 | `POST /auth/refresh` with a valid refresh token returns new tokens and invalidates the old refresh token; presenting the old one again revokes the session (`AUTH_013`) | none |
| AC-02.7 | `POST /auth/logout` revokes the session and clears the cookies | none |

**US-03.** As a learner, I want to sign in with Google, so that I need no password.

| AC | Criterion | Evidence |
| :--- | :--- | :--- |
| AC-03.1 | The callback with a state that is unknown or expired is refused (`AUTH_008`) | none |
| AC-03.2 | A Google account whose email is not verified is refused (`AUTH_009`) | none |
| AC-03.3 | A first Google sign-in creates the account in a transaction, with the free credits | none |

**US-04.** As a learner, I want to reset or change my password, so that I keep access to my account.

| AC | Criterion | Evidence |
| :--- | :--- | :--- |
| AC-04.1 | `forgot-password`, `verify-forgot-password` and `reset-password` in order change the password; the reset token is valid for 300 seconds | none |
| AC-04.2 | `change-password` requires the current password and a matching confirmation | none |

### 4.2. Content

**US-05.** As a guest or learner, I want to browse forecasts, topics and questions, so that I know what to practice.

| AC | Criterion | Evidence |
| :--- | :--- | :--- |
| AC-05.1 | `GET /forecast` is paginated, filters by quarter, year and status, and searches by name; it works without a token | none |
| AC-05.2 | `GET /forecast-topic`, `GET /forecast-question` and their `/:id` routes answer without a token | none |
| AC-05.3 | A forecast that does not exist answers `404` | none |

**US-06.** As a learner, I want to hear a question read aloud, so that I practice listening and pronunciation.

| AC | Criterion | Evidence |
| :--- | :--- | :--- |
| AC-06.1 | `GET /question/:id/audio` answers without a token with the audio of the question; the audio of the same text and voice is generated once and reused (`GeneratedAudio.cacheKey`) | none |
| AC-06.2 | `PUT /account/select-voice` changes the voice used | none |

### 4.3. Practice and Scoring

**US-07.** As a learner, I want to record an answer to one question and get a score, so that I know how I did.

| AC | Criterion | Evidence |
| :--- | :--- | :--- |
| AC-07.1 | `POST /attempt` charges the cost of the part (BR-02) and creates an attempt `PENDING` in one transaction | none |
| AC-07.2 | With too little balance the request fails with `INSUFFICIENT_BALANCE` (400) and no attempt exists | none |
| AC-07.3 | Two parallel charges never drive the balance below zero | test: `tests/api/credit-and-payment.test.ts` (never lets parallel deductions drive the balance below zero) |
| AC-07.4 | The attempt goes `PENDING`, `PROCESSING`, `DONE` through transcribe, assess and evaluate; each change is sent as `attempt:updated` | none |
| AC-07.5 | A failed stage is retried automatically 3 times; after that the attempt is `FAILED` with `failedStage` and `error` | none |
| AC-07.6 | `POST /attempt/:id/retry` resumes from the failed stage, at most once | none |
| AC-07.7 | When scoring fails after the retry, the credit is refunded exactly once with a `refund` credit log row | none |

**US-08.** As a learner, I want to take a mock test of one part or the full test and get an overall band, so that I can judge my level.

| AC | Criterion | Evidence |
| :--- | :--- | :--- |
| AC-08.1 | `POST /speaking-session` charges the session cost once (BR-03) and creates a session with its questions | none |
| AC-08.2 | `GET /speaking-session/:id/current-question` returns the next unanswered question; `GET /speaking-session/active-session` returns the unfinished session | none |
| AC-08.3 | When the last answer is `DONE` the session band is computed once (`scoringQueuedAt`) and the status becomes `COMPLETED` (BR-09) | none |
| AC-08.4 | If any attempt fails, the session is `FAILED`; `POST /speaking-session/:id/retry` reruns the failed attempts once | none |
| AC-08.5 | A failed session after the retry is refunded once as a whole | none |

**US-09.** As a learner, I want to see my scores and where I went wrong, so that I know what to improve.

| AC | Criterion | Evidence |
| :--- | :--- | :--- |
| AC-09.1 | `GET /attempt/:id` of a `DONE` attempt returns the overall, fluency, pronunciation, lexical and grammar bands | none |
| AC-09.2 | The analysis gives each word with an accuracy score and error type, and lexical and grammar issues aligned to word positions | none |
| AC-09.3 | `GET /attempt/:id/word-audio` returns a model pronunciation of a word, only for the owner | none |
| AC-09.4 | `GET /vocabulary-suggestion/approved` returns approved suggestions for a question without a token | none |
| AC-09.5 | A learner cannot read the attempt of another learner | none (the answer is `403` today; the target is `404`) |

**US-10.** As a learner, I want to share a result and see the best answers, so that I get feedback and motivation.

| AC | Criterion | Evidence |
| :--- | :--- | :--- |
| AC-10.1 | `PUT /attempt/:id/share` sets or clears `isPublic` for the owner of a `DONE` attempt; another user gets `403`, an unfinished attempt `400` | none |
| AC-10.2 | `GET /attempt/leaderboard` is public and returns at most 10 public `DONE` attempts of a question within a band, best first | none |

### 4.4. Account and Credit

**US-11.** As a learner, I want to update my profile and avatar, so that my account is mine.

| AC | Criterion | Evidence |
| :--- | :--- | :--- |
| AC-11.1 | `PUT /account/update-profile` updates the allowed fields only | none |
| AC-11.2 | `POST /file/upload-image` accepts an image that passes the size, type and content checks and refuses others | none |

**US-12.** As a learner, I want to see every credit change, so that I can check my balance.

| AC | Criterion | Evidence |
| :--- | :--- | :--- |
| AC-12.1 | `GET /credit-log` lists only the caller's rows, newest first, paginated, with the balance before and after | none |
| AC-12.2 | For every row, `balanceAfter` equals `balanceBefore` plus the amount of a `plus` row or minus the amount of a `minus` row | none |

**US-13.** As a learner, I want to buy credit by bank transfer, so that I can keep practicing.

| AC | Criterion | Evidence |
| :--- | :--- | :--- |
| AC-13.1 | `GET /credit-package` lists the active packages without a token | none |
| AC-13.2 | `POST /payment` returns the QR and bank data and a payment valid for 15 minutes; a pending payment for the same package and method that stays valid for more than 3 minutes is returned instead of a new one | none |
| AC-13.3 | A valid webhook for a pending payment with the right amount adds the points once and writes a `payment` credit log row | test: `tests/api/credit-and-payment.test.ts` (credits the points once when the same successful webhook arrives twice) |
| AC-13.4 | A webhook whose amount differs adds no credit | test: `tests/api/credit-and-payment.test.ts` (ignores a webhook whose amount differs) |
| AC-13.5 | A webhook with an invalid signature adds no credit | none |
| AC-13.6 | An unpaid payment past its expiry reads as `EXPIRED` | none |

### 4.5. Voice Rooms

**US-14.** As a learner, I want to join a voice room with other learners, so that I practice speaking with people.

| AC | Criterion | Evidence |
| :--- | :--- | :--- |
| AC-14.1 | `GET /voice-room` lists active rooms without a token; creating, joining and leaving need a token | none |
| AC-14.2 | A room holds between 2 and 10 participants; a private room needs its PIN | none |
| AC-14.3 | Closing a room is refused with `403` to a user who is not the host; pinning a question, mute, unmute, kick and transfer of the host role are host routes | none (code for the close check) |
| AC-14.4 | Room and chat changes reach the lobby or room members through Socket.io | none |

### 4.6. Administration

**US-15.** As an administrator, I want to manage content, groups and permissions, so that the platform stays current and safe.

| AC | Criterion | Evidence |
| :--- | :--- | :--- |
| AC-15.1 | A route that needs a permission answers `403` when the token lacks it | test: `tests/api/http-basics.test.ts` (answers 403 when the token lacks the permission of an admin route) |
| AC-15.2 | Every route that changes or lists other users' data is protected by a permission | none (nine routes have no check, see the [endpoint index](../08-integration-contracts/03-endpoint-index.md)) |
| AC-15.3 | Forecasts, topics, questions, voices and credit packages can be created and updated by an administrator | none |
| AC-15.4 | A change of a group's permissions applies to a user at the next token refresh | none |

### 4.7. Operation

**US-16.** As an operator, I want health checks and traceable errors, so that I can run and debug the service.

| AC | Criterion | Evidence |
| :--- | :--- | :--- |
| AC-16.1 | `GET /health` answers `200` without touching dependencies | test: `tests/api/http-basics.test.ts` |
| AC-16.2 | `GET /ready` answers `200` when MongoDB and Redis answer and `503` when one is down | test: `tests/api/http-basics.test.ts` |
| AC-16.3 | A valid `X-Request-Id` is kept, an invalid one replaced, and the id is returned in error bodies | test: `tests/api/http-basics.test.ts` |
| AC-16.4 | A protected route without a token answers `401`; an invalid token `401`; an unknown route `404` | test: `tests/api/http-basics.test.ts` |
| AC-16.5 | The process exits with the requested code on SIGINT or SIGTERM, even while a Socket.io client is connected | test: `tests/unit/shutdown.test.ts` |

## 5. Coverage Summary

5.1. 16 user stories and 64 acceptance criteria. 12 criteria have an automated test and 52 have none. The gap is the input of the test plan.
