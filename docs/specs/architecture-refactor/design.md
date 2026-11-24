# Architecture Refactor: Design

> Status: **draft, not yet verified by the owner.** Every observation in §11 comes from reading the code and running ESLint, `tsc` and small scripts; the owner has not re-checked it. Items that could not be verified are listed in §15.
> Scope: make the monolith **clean**: the right modules in the right places, consistent conventions, no duplicated logic, and the cross-cutting infrastructure that is missing (logger, tracing, monitoring, cache). It is **not** a preparation for microservices; the few things that only matter for a split are in §16 "Deferred".
> Related: `architecture_roadmap.md` (workspace folder) is the long-term target; §14 shows how this spec relates to it.
> Ids: `F<n>` are audit findings (§11.1). Epics (`E<n>`) are in the [backlog](../../plan/backlog.md).

## 1. Purpose and scope

The BE works, but it grew without a plan:

- 23 module folders, two of them (`mail`, `speech`) are only thin wrappers; the real mail and speech code lives in `infrastructure/`, `resources/` and `attempt/`.
- `common/` and `infrastructure/` mix technical code with business code (scoring rubric, speaking queue, LiveKit, mail templates).
- Modules call each other freely: five pairs of modules depend on each other, and about 40 `.populate()` calls reach into another module's collections.
- Business logic is copied (credit deduction in six places), state changes are implicit, and some code is plainly wrong (§11).
- The logger is never used, there is no request id, health check, metrics, cache or timeouts.

**In scope:** folder and module structure, conventions and clean-code rules, module boundaries, the shared `core/` code, configuration, environments and seed policy, missing cross-cutting infrastructure, bug fixes found in the audit, data-model clean-up, work breakdown.

**Out of scope** (separate specs or tickets): scoring pipeline v2 (`../scoring-pipeline-v2/design.md`), the admin CMS UI, social features (friends, chat, calls), CI/CD and deployment (backlog Phase 3), the full test suite (backlog Phase 4), performance work (Phase 6).

## 2. Target layout

### 2.1 Top-level folders

```
src/
  main/       entry points (api, worker), DI container, route table
  config/     environment schema and one typed config object per concern
  core/       technical code with NO business names
  modules/    the 10 business modules (§2.2)
  scripts/    seed:reference, seed:demo
```

Rule: **`core/` and `config/` never contain a business concept** (speaking, mail, livekit, evaluator, storage...). Anything that knows a business concept lives in the module that owns it.

`core/` contains, by technical concern: `http` (response envelope, controller binding), `middlewares` (auth, validation, error, request id, rate limit), `persistence` (base repository, base model, mapper, query builder), `errors`, `logging`, `cache`, `queue` (queue factory, base producer and consumer, worker setup, queue dashboard), `realtime` (socket server), `security` (JWT, hasher), `redis` (client factory, key helper), `types`, `utils`, `error-codes`.

### 2.2 The ten modules

| Module | Owns | Current folders that move in |
| :--- | :--- | :--- |
| `account` | user profile and preferences; roles and permissions (`access/`: group, permission, permission-group) | `account`, `group`, `permission`, `permission-group` |
| `auth` | registration, login, OTP, Google login, sessions, refresh tokens, password reset; `social-identity/` keeps the link between an account and its Google id (Google is the only provider, no other is planned) | `auth`, `session`, `account-provider` |
| `content` | exam content written by admins: `topic/`, `question/`, `forecast/` (forecast + its topic and question links), `vocabulary/` (hints per question) | `topic`, `question`, `forecast`, `forecast-topic`, `forecast-question`, `vocabulary-suggestion` |
| `practice` | what the learner does: attempts, mock tests, history, leaderboard, sharing | `attempt` (without the scoring parts), `speaking-session` (as `mock-test`) |
| `assessment` | turning a recorded answer into scores and feedback: STT, pronunciation, LLM evaluation, result storage | scoring parts of `attempt` (`speaking-analysis*`, `attempt-analysis*`, `speech.mapper`) and the STT, pronunciation, evaluator and LLM providers |
| `billing` | credit wallet and ledger, credit packages, payments (PayOS), prices | `payment`, `credit-package`, `credit-log` plus the balance stored on `account` |
| `file` | upload, file metadata, storage provider, audio normalisation | `file`, storage and ffmpeg providers, the old `speech` module |
| `tts` | text-to-speech: voices, generated-audio cache, TTS provider | `voice`, `generated-audio`, TTS providers |
| `voice-room` | live practice rooms (LiveKit) | `voice-room`, LiveKit service |
| `notification` | sending messages to users: email now, in-app now, SMS and push later | old `mail` module, mail producer, consumer, provider and templates; the in-app part replaces direct socket emits |

Why these boundaries (checked against the code, not only the names):

- **`account` vs `auth`:** they are separate because `auth` is the part that could later be replaced by an identity provider such as Keycloak, while the profile and the app's roles stay. Rule: `auth` may depend on `account`, never the reverse; nothing outside `auth` touches passwords, OTP, sessions or refresh tokens; every other module only reads `req.user` (id, role, permissions).
- **Roles and permissions live in `account`:** an account has a required `groupId`, creating one needs the default group, and loading an account for login populates its group and permissions. They cannot work independently.
- **`assessment` vs `practice`:** different vocabulary (a learner's submission vs measuring speech), different speed of change (scoring v2 will replace it), different resources (external AI calls, possibly a Python service later).
- **`tts` vs `file`:** TTS has its own reason to change (provider and voices) and currently leaks into `file` (`FileService.generateAndSaveAudio`).
- **`content` is one module** because one import creates topics, questions and a forecast together and vocabulary hints attach to a question. A learner's personal vocabulary list (future) would belong to `practice`, not here.
- The old `mail` and `speech` modules disappear as modules; their content moves to `notification` and `file`.

### 2.3 Inside a module

One layout everywhere (today repositories are at the module root in 9 modules and in `repositories/` in 11; types are in `.type.ts` or `types/`):

```
<module>/
  <name>.controller.ts  <name>.service.ts  <name>.route.ts  <name>.validation.ts
  <name>.dto.ts  <name>.mapper.ts  <name>.model.ts  <name>.constants.ts  <name>.di.ts
  repositories/   <name>.repository.ts  <name>.repository.interface.ts
  adapters/       external providers used only by this module
  jobs/           producer, consumer, job types of this module
  public.ts       the few functions other modules may call
```

Sub-areas (`account/access/`, `content/forecast/`, `auth/session/`) repeat the same layout. Files are `kebab-case`, `<name>.<role>.ts`. A `dto` or `mapper` file exists only if it maps something; a plain `_id` to `id` rename is not a reason for a mapper.

### 2.4 Where today's shared code goes

| Current | New | Change |
| :--- | :--- | :--- |
| `index.ts`, `bootstrap/container.ts`, `routes/index.ts` | `main/` | one entry per role (`api`, `worker`); route files stop resolving the container at import time |
| `common/config/*` (env, cors, mongo, redis, logger, swagger) | `config/` | one schema grouped by concern (§6.1) |
| `common/base/*` | `core/persistence/` | trim and fix (§7) |
| `common/middlewares/*`, `infrastructure/rate-limiter/*` | `core/middlewares/` | all middleware in one place; rate limiter service next to it |
| `common/http/*` | `core/http/` | remove `asyncHandler` |
| `common/errors`, `common/types`, `common/utils`, `common/constants/error-codes` | `core/errors`, `core/types`, `core/utils`, `core/error-codes` | |
| `common/contracts/*` (hasher, token service interfaces) | `core/security/` | next to their implementations |
| `common/constants/di.tokens.ts` | split: each module keeps its own repository token | stops `common` from knowing all modules |
| `common/constants/status.constants.ts` | each module defines its own status enum | §7 |
| `infrastructure/cache, redis, security, logging` | `core/cache, redis, security, logging` | one logger (§6.2) |
| `infrastructure/queues, workers` | `core/queue/` | generic only: factory, base producer and consumer, worker setup, dashboard |
| `queues/types/speaking.job.types`, `speaking.producer`, `speaking.consumer` | `practice/jobs/` | business code leaves `core` |
| `mail.producer`, `mail.consumer`, `providers/mail`, `resources/mail-templates.ts`, `modules/mail` | `notification/` | §4.7 |
| `infrastructure/socket` | `core/realtime/` (server) and `voice-room/` (voice-room handlers) | the bootstrap no longer imports `voice-room` |
| `infrastructure/livekit` | `voice-room/adapters/` | only voice-room uses it |
| `providers/stt, speech-assessment, evaluator, llm` | `assessment/adapters/` | |
| `providers/tts` | `tts/adapters/` | §4.5 |
| `providers/storage`, `providers/media/ffmpeg` | `file/adapters/` | |
| `providers/vocabulary-extractor` | `practice/jobs/` (only if kept, §4.2) | |
| `infrastructure/event-bus/*` | deleted | nothing publishes to it (§11) |
| `infrastructure/bull-board.config.ts` | `core/queue/` | development only |
| `scripts/seed.ts` | `scripts/seed-reference.ts`, `scripts/seed-demo.ts` | §6.4 |

### 2.5 Dependency check between the ten modules

Method: map every file to its target module (scoring files of `attempt` to `assessment`, `vocabulary-extraction` to `practice`, the old `speech` module to `file`) and count imports of another module's files. `populate` calls are counted separately (F1).

Current imports between modules (module → module: count): account → auth 1, billing 2, tts 1; assessment → account 1, billing 3, content 1, practice 3; auth → account 2; billing → account 1, practice 1; content → file 1, tts 2; practice → account 2, assessment 1, billing 6, content 9, file 2, tts 3; tts → file 2, practice 1; voice-room → account 1, content 1.

Five pairs call each other:

| Cycle | Cause | Fix |
| :--- | :--- | :--- |
| account ↔ auth | `account.service` imports types defined in `auth/types/auth.type`, which imports `account.validation` | profile and change-password types and schemas belong to `account`; `auth` imports them |
| account ↔ billing | `payment.service` imports `AccountService` to add balance; `account.service` imports `CreditLogService` for the signup gift | the balance moves into `billing` (wallet); `account` only calls `billing.grant` |
| assessment ↔ practice | `speaking-analysis.service` updates attempts and sessions directly (imports their repositories and constants); vocabulary extraction reads `attempt-analysis` | `assessment` reports through a listener interface that `practice` implements (§3); practice reads results through `assessment.getResult(attemptId)` |
| billing ↔ practice | `credit.util.ts` imports the speaking-session constants | pricing in `billing` uses its own action names; `practice` maps mode and type to them |
| practice ↔ tts | `voice.service.ts` imports `INSTRUCTION_SCRIPTS` from speaking-session constants | move that constant into `tts` |

After the fixes the graph has no cycle. Order from the bottom: `billing`, `file`, `assessment`, `notification` have no dependencies on other modules; then `tts` (→ file); then `account` (→ billing, tts, notification via auth); `auth` (→ account, notification); `content` (→ tts, file); `voice-room` (→ account, content); `practice` on top (→ account, assessment, billing, content, file, tts, notification).

Enforced by `dependency-cruiser` in CI: no import into another module except its `public.ts`, no cycles, nothing in `core/` or `config/` imports `modules/`.

## 3. How modules talk

- **One mechanism between modules:** a call to a public function of the other module (`public.ts`), with plain DTOs in and out. Writes that can be retried carry an idempotency key.
- **Asynchronous work stays inside a module:** a module that needs a long job (scoring, mail) puts it on its own BullMQ queue and processes it itself.
- **No event bus and no outbox** (the unused `EventBus` is deleted). Where one module must call back another without importing it, the **callee owns an interface and the caller implements it** (dependency inversion). The only such place is scoring:

```
practice  ──submit(attemptRef, audioUrl, question)──▶  assessment   (enqueues its own job)
practice  ◀──onCompleted / onFailed(attemptRef, …)────  assessment   (interface AssessmentListener, defined in assessment,
                                                                      implemented in practice, registered in the container)
```

`assessment` never imports `practice`. `practice` reads stored results with `assessment.getResult(attemptId)`. If `assessment` is ever moved to another process, the listener becomes a callback or a queue; callers do not change.

Rule: if two modules would need to call each other, the boundary is wrong; merge them or move the shared part.

## 4. Module decisions

### 4.1 `account` and `auth`

- `account`: profile, selected voice, roles and permissions. `balance` leaves (→ `billing.wallet`); `kind` is derived from the group; the unused default status `PENDING` goes (accounts exist only after OTP verification and are created `ACTIVE`).
- `account` exposes `getAccountForLogin(email)` (id, email, password hash, permission codes) so `auth` never touches `Group` or `Permission`.
- Permission tables stay database-driven: the admin CMS is planned and will probably manage roles. `PermissionGroup` is only a label for grouping in the UI.
- `auth` is split into credential, session and social-login services (the OTP service exists). `AuthService` has 504 lines and 9 constructor dependencies.
- Replacing `auth` by an identity provider later means replacing the `auth` folder and the token verification (`ITokenService`); `account` and its roles stay. The `password` field in the account model would then be dropped.

### 4.2 `content` and vocabulary

- Vocabulary hints are admin-authored content attached to a question; learners only see approved ones (`/vocabulary-suggestion/approved`).
- **AI vocabulary extraction is switched off by default** (feature flag). Today every scored attempt that passes `lexical ≥ 6`, `grammar ≥ 6`, `≥ 20 words` costs one more LLM call, and the result is stored as `pending` with source `llm`. There is no admin screen to approve anything, so no learner can see these rows. The extraction service also imports `attemptRepository` and `forecastQuestionRepository` of other modules and populates the question and its parent.
- If it is kept later it lives in `practice/jobs/` (it reads attempt data) and calls `content.vocabulary.suggest(...)`. If the CMS shows it is not used, delete it (history is in git).
- The manual flow (create, approve, hide, update, list approved, audio) stays in `content/vocabulary/`.

### 4.3 `billing`

- `wallets` collection (`accountId` unique, integer `balance ≥ 0`, `version`) and the existing credit log as the ledger. The wallet is part of `billing`, not a module of its own. **Why it leaves `account`:** the balance and the ledger entry (`balanceBefore`, `balanceAfter`) must change in one transaction; today four services update the balance on `account` and write the ledger in `credit-log` with a shared session, which is a transaction across two modules and the cause of the account ↔ billing cycle. A leaner alternative (keep `balance` on `account`, expose `account.adjustBalance(delta, tx)`, move the signup grant into `auth`) avoids the migration but keeps the transaction across two modules; this spec prefers the wallet. `/account/me` keeps returning `balance` (the FE reads it in several screens).
- Public functions: `charge`, `refund` (returns exactly what was charged, once), `grant`, `getBalance`, `quote`.
- Ledger entries are unique per `(accountId, refType, refId, type)`. The practice charge must use the attempt id as `refId` (today it uses the question id, F5).
- Payment gets a small transition table (`PENDING → PAID | EXPIRED | CANCELLED | FAILED`), an expiry job, and the raw webhook payload.
- Pricing (`calculateCreditCost`, `CREDIT_COST`) moves here with its own action names.
- `/account/me` composes the balance from the wallet; its response shape does not change.

### 4.4 `practice` and `assessment`

- `practice`: attempts, mock tests, history, leaderboard, sharing, retry. A `SubmitAnswerService` replaces the logic spread over `attempt.service` and `speaking-session.service`; both `delay()` hacks go.
- `assessment`: owns the stage runner (transcribe → pronunciation → evaluate), the stored results (`attemptanalyses`), and the providers (Groq STT and LLM, Azure pronunciation, evaluator with rubric and prompt builder). It calls no other module except the listener.
- `SpeakingAnalysisService` (12 constructor parameters, 7 direct `socketService.emit` calls, provider names hard-coded) is split into the stage runner (`assessment`) and a result applier plus mock-test aggregation (`practice`, in the listener). Provider and model names come from the provider itself.
- Attempt status keeps its numeric values (no data conversion) but gets named constants and a transition table; the stage fields (`currentStage`, `failedStage`) stay on the attempt as a progress projection written by the listener so the FE needs no change.
- A reconciler job (§9) removes the one real dual-write: attempt committed but job not enqueued.

### 4.5 `tts`

- One interface `TtsProvider.textToSpeech(text, voiceCode, speed, pitch) → { buffer, duration }`. Two implementations already exist with exactly this signature: `EdgeTTSProvider` (uses the unofficial `node-edge-tts` library, no guarantee from Microsoft) and `AzureSpeechProvider` (official SDK, currently unused, `AZURE_SPEECH_KEY` is already required).
- Provider chosen by `TTS_PROVIDER=azure|edge`; **default `azure`**. Voice codes in the seed (`en-US-AriaNeural`...) are Microsoft neural voice names, so they should work with Azure (to be tested). Self-hosted TTS is a later option.
- Fix before switching: the Azure provider interpolates the text into SSML without escaping XML characters (`&`, `<`).
- Audio is cached by text and voice (`generated-audio`), so each text is synthesised once; cost is small (current Azure prices not checked).
- `FileService.generateAndSaveAudio` moves into `tts`; `tts` calls `file.storeAudio`. `file` no longer knows TTS.

### 4.6 `file`

- Upload, metadata, Cloudinary storage adapter, audio normalisation (ffmpeg) as an adapter inside `file`. Public: `getAudioForOwner(fileId, ownerId)` (not the owner ⇒ 404), `storeAudio(...)`.
- Temp files use `randomUUID()` instead of `Date.now()` (collision).
- Unused methods removed (§11).

### 4.7 `notification`

```
notification/
  notification.service.ts    sendOtp(email, otp), sendToUser(...)
  channels/  email/ (Brevo provider)   in-app/ (socket)   sms/ and push/ (later)
  templates/ otp.ts, ...
  jobs/      producer, consumer          own queue
  public.ts
```

- Today `auth.service` builds the OTP HTML (`registerOtpTemplate`) and pushes ready HTML into a queue. After the change `auth` calls `notification.sendOtp(email, otp)`; content, channel and retry are notification's business.
- Implemented now: email and in-app. The in-app channel replaces the 7 direct `socketService.emit` calls and is the `Notifier` that `practice` calls when an attempt or mock test changes. SMS, push (FCM) and a notification history API are added with the feature.

### 4.8 `voice-room`

- `voice-room.service` (692 lines) is split into room (create, list, update, close), participation (join, leave, LiveKit token, PIN), host control (transfer, mute, kick, pin question) and the LiveKit webhook handler.
- PIN stored hashed with a limited number of attempts; the pinned question is stored as a snapshot instead of populating the `Question` model; the chat socket room checks membership; sender name and avatar come from the server.
- The LiveKit service and the voice-room socket handlers live in this module.

## 5. Conventions and clean-code rules

| Area | Rule | Tool |
| :--- | :--- | :--- |
| Structure | one module layout (§2.3); one place for repositories and types | review, `dependency-cruiser` |
| Naming | `kebab-case` files `<name>.<role>.ts`; fix `socket-boostrap`; `session` becomes `auth/session`; model class `MockTest` for `speaking-session` (collection and route unchanged) | review |
| Layers | controller has no business logic and never touches a repository; services do not contain Mongo operators (`$inc`, `$set`): the repository exposes named methods (`markPaid`, `advanceProgress`) | review |
| Boundaries | no import into another module except `public.ts`; no cross-module `populate` | `dependency-cruiser` |
| Duplication | credit logic only in `billing`; no copied blocks | `jscpd` (run locally) or SonarCloud |
| Constants | no magic numbers or hard-coded strings in services; user-facing strings are keys, not Vietnamese text in services | ESLint |
| Statuses | one enum per entity with a transition table for Payment, Attempt, MockTest | tests |
| Types | no `any` in new code (180 today); `session: any` becomes `TxContext`; no `as unknown as` | ESLint `no-explicit-any` (ratchet) |
| Size | functions ≤ 70 lines, complexity ≤ 12, ≤ 5 parameters; fix the 23 worst (F25) | ESLint `complexity`, `max-lines-per-function`, `max-params` |
| Errors | `AppError` with a stable `errorCode`; 5xx always logged; no empty or swallowing `catch` | review, ESLint |
| Logging | no `console.*` (76 today); logger only | ESLint `no-console` |
| Dead code | none | `tsc --noUnusedLocals`, `knip` or similar |
| Formatting | Prettier (exists); SonarCloud for the quality report if the repository is public | CI |

## 6. Core infrastructure that is missing

### 6.1 Configuration

- One schema in `config/`, grouped (core, mongo, redis, auth, mail, storage, payment, ai, tts, livekit). A group is required only when its feature is enabled; in `NODE_ENV=test` third-party keys are optional.
- Drop noise: `AUTHOR` and `APP_NAME` are required but only used by the empty Swagger config; `PORT` and `APP_PORT` duplicate each other.
- `.env.example` must list every variable (today `MONGODB_URI` is empty and no Redis variable is listed); add `.env.test`.
- Business constants (prices, expiry, retries) stay in the owning module; only values operations will tune become env variables.

### 6.2 Logging and tracing

- One structured JSON logger to stdout (the repository has two logger definitions and neither is used), levels from config, redaction of `password`, tokens and `authorization`. No log files in containers.
- A `requestId` per request (from the incoming header when present) carried by `AsyncLocalStorage`, written in every log line, returned in error responses, and copied into BullMQ job data so a scoring run can be followed from the request to the last stage. Full distributed tracing (OpenTelemetry) is deferred.
- The error middleware logs every 5xx with the request id (today only in development).

### 6.3 Monitoring and resilience

- `/health` (process up) and `/ready` (Mongo and Redis reachable), graceful shutdown with a timeout, handlers for `unhandledRejection`.
- `/metrics` (HTTP latency, queue depth, external-call duration) and an error tracker (Sentry or similar) with an uptime check.
- Timeouts, taken from config, on every Groq, Azure, LiveKit, PayOS and axios call so one hung call cannot block a queue; Mongo `serverSelectionTimeoutMS` and `maxPoolSize`.
- Global rate limit plus limits on registration, OTP, upload, attempt creation and payment creation; fix the limiter key (`_id`, `trust proxy`).
- `Idempotency-Key` on `POST /attempt` and `POST /payment` (a double click currently charges twice for practice).
- Audit log for admin actions (who changed what), written when the CMS is built.

### 6.4 Cache

Redis is already used for OTP, rate limits and socket tickets only. Add cache-aside with a TTL and a little jitter, invalidated when an admin writes, for read-heavy public data: forecast list and detail, credit packages, voice list, approved vocabulary. **Never cache** wallet balance, payments, attempts. Start with these; measure before adding more.

### 6.5 Environments and seed

| Environment | Mongo | Redis |
| :--- | :--- | :--- |
| Dev | managed service, a database separate from staging and production | managed service that allows `noeviction` (BullMQ requirement) |
| Test / CI | in-memory Mongo replica set | none or container |
| Staging / production | managed service, one database and one account per environment | managed service that allows `noeviction`; not a serverless tier |

- Same variable names everywhere (`MONGODB_URI`, `REDIS_URL`); only values differ. Production deploys only the BE (and FE) images; databases are managed services.
- `docker-compose.dev.yaml` currently runs only `api`, so development points at whatever `.env` contains. `seed.ts` runs `deleteMany({})` on several collections: if `.env` points at a cloud database, `pnpm db:seed` wipes it. Seed becomes:

| Script | Content | Where it may run |
| :--- | :--- | :--- |
| `seed:reference` | groups, permissions, credit packages, voices: idempotent upserts | every environment |
| `seed:demo` | demo accounts with passwords from env | local development only (refuses to run in production) |
| (not a seed) | forecasts, topics, questions | imported by admins through the import endpoint |

- Database versioning: no migration tool until the first deploy that holds real data; then `migrate-mongo` with a baseline migration (indexes and reference data). Before that, data in development databases may be reseeded.

## 7. Generic code

| Item | Today | Change |
| :--- | :--- | :--- |
| `BaseRepository` | 18 methods, about 8 used; `create()` returns a different shape from `find`; invalid ObjectId gives 500; `session: any` | keep used methods (`findById/One/Many`, `paginate`, `count`, `create`, `updateOne/ById/Many`, `withTransaction`, `aggregatePaginate`, soft delete); remove `restoreById`, `createMany`, `hardDeleteById`, `exists`; same shape from `create`; invalid id ⇒ 404; typed `TxContext` |
| `QueryBuilder` | guesses types from field names (`endsWith('Id')`, `/(date\|at)$/i`), converts `'true'` and numeric strings anywhere | typed whitelist per query; whitelist required |
| Soft delete | 17 models have `deletedAt` and every query adds `deletedAt: null`, but only group, permission and permission-group are deleted softly | keep only on entities that are deleted; `deletedAt` is not part of the base schema |
| `STATUS` | one numeric enum shared by account, voice, topic, question, file, generated-audio | an enum per entity |
| `asyncHandler` | redundant (Express 5 forwards rejected promises) | remove |
| `bindHandler` | resolves the controller by name | keep |
| DI tokens | 23 repository tokens in `common/constants/di.tokens.ts` | each module keeps its own; no new tokens |
| Response messages | fixed English success strings in every controller | keep a single default; messages carry no logic |

## 8. Data model changes

| Collection | Change | Migration |
| :--- | :--- | :--- |
| `accounts` | remove `balance` (moves to `wallets`), `kind` (derived from the group; only the mapper and the seed read it, `Group.kind` stays for the admin check) and `isSuperAdmin` (nothing reads it: no bypass is implemented; remove it or implement it); remove default `PENDING`; unique generated `username` | script copies `balance` to `wallets`; the other old fields can stay unused in existing documents |
| `wallets` (new) | `{accountId unique, balance integer ≥ 0, version}` | script (or reseed) |
| `creditlogs` | unique `(accountId, refType, refId, type)`; practice charge `refId = attemptId`; **keep `description`** (the FE renders `item.description` in `credit-log-tab.tsx`); `descriptionKey` and `descriptionMetadata` are not read by the FE (only declared in its type) and can be dropped, or kept if i18n of the log is planned | old rows unchanged |
| `payments` | drop `webhookVerified` (written once at `payment.service.ts:102`, never read, FE does not use it; remove the write too) and `retryCount` (declared only in the model; the `retryCount` of attempts and mock tests is used and stays); add `failureReason`, `rawWebhook`, optional `canceledAt`; remove duplicate `orderCode` index | none |
| `attempts` | add `questionSnapshot`, `idempotencyKey` (unique `(userId, key)`, TTL); drop single-field indexes on `userId`, `status`, `isPublic`, `analysisProfile`; add `(status, createdAt)` for the reconciler | old rows fall back to a live lookup |
| `attemptanalyses` | unchanged; owned by `assessment` | none |
| `speakingsessions` (model `MockTest`, collection and route unchanged) | drop default `startedAt`; add `(userId, createdAt)` | none |
| `sessions` (auth) | drop `unique` on `userId`; add unique `(userId, sid)` only if multiple devices are needed (§15); remove duplicate `index: true` | `syncIndexes` |
| `voicerooms` | `pinCode` → `pinHash`; `pinnedQuestionId` → `pinnedQuestion{questionId, content, part}` | open rooms expire |
| `generatedaudios`, `files`, `questions`, `forecast*`, `accountproviders`, `vocabularysuggestions` | drop the redundant indexes of F15 | `syncIndexes` |
| `modules/forecast/forecast-topic.model.ts` | delete the unused duplicate model (F14); safe: no file imports it | none |
| `Part1/2/3Question`, `AudioFile`, `ImageFile` (discriminators) | **keep the `discriminator(...)` calls**: question creation is `create({...data, part})` on the base model and relies on the registered discriminator to keep `bulletPoints` and `parentId`; only the unused `export` keywords can go. Confirm with a test before touching | none |
| Redundant indexes | removing `index: true` in code does not drop existing indexes: run `syncIndexes` or drop them manually in each database | per database |

## 9. Flows after the refactor

**Submit an attempt (`POST /attempt`)**
1. Read the optional `Idempotency-Key`; if an attempt exists for `(userId, key)` return it.
2. `SubmitAnswerService` (practice): `content.getQuestionSnapshot` → `file.getAudioForOwner(fileId, userId)` (not the owner ⇒ 404) → pre-generate `attemptId`.
3. `billing.charge({refType: 'USAGE', refId: attemptId})`, idempotent.
4. One transaction inside practice: create the attempt (with `questionSnapshot`) and, for a mock test, advance progress.
5. `assessment.submit(...)` enqueues its job with `jobId = attemptId`. If step 4 or 5 fails, `billing.refund` with the same reference.
6. Respond 201.

**Scoring:** the `assessment` worker runs the stages, stores results, then calls `AssessmentListener.onCompleted` or `onFailed`. The practice listener updates the attempt with a state-conditional transition, calls the `Notifier`, aggregates the mock-test result when all answers are done (`scoreSession` moves into `practice/mock-test`), and on failure after the last retry marks the attempt `FAILED` and calls `billing.refund`.

**Reconciler (every few minutes):** attempts in the submitted state older than 5 minutes with no job are re-enqueued; after K tries, or in processing for more than 15 minutes, they are marked `FAILED` and refunded.

**Create a mock test:** `content.pickMockQuestions` → `tts.getVoice` → `billing.charge({refId: mockTestId})` → create. The recent-sessions query gets its missing sort.

**PayOS webhook:** invalid signature ⇒ 400; one transaction inside billing: `PENDING → PAID` with a state-conditional update plus `grant({refType: 'PAYMENT', refId: paymentId})`; a processing error ⇒ 500 so PayOS retries; already processed ⇒ 200; store the raw payload. A scheduled job expires overdue payments.

**Register:** generate a unique `username`; create the account; `billing.grant({refType: 'MANUAL', refId: accountId})`; if the grant fails the wallet is created lazily on first read; `notification.sendOtp` sends the OTP email.

## 10. API changes and FE impact

Admin endpoints move under `/api/v1/admin/*` with one router-level guard (authenticated, admin group, audit log) and each route still declares its own permission; one test walks the router and fails if an admin route has none. The learner FE calls none of the moved endpoints (checked against `speprove-fe/src/constants/api-config.ts`).

| Current | New |
| :--- | :--- |
| `GET /account` | `/admin/accounts` |
| `POST/PUT/GET(list) /question`, `/topic` | `/admin/questions`, `/admin/topics` |
| `POST /forecast` (create, import), `POST /forecast-question` (import) | `/admin/forecasts/...` |
| `POST /credit-package` | `/admin/credit-packages` |
| `POST /voice`, `PUT /voice/:id`, `PUT /voice/activate/:id` | `/admin/voices` |
| `/vocabulary-suggestion` list, create, approve, hide, update | `/admin/vocabulary-suggestions` |
| `/group`, `/permission`, `/permission-group` | `/admin/groups`, `/admin/permissions`, `/admin/permission-groups` |

Learner endpoints used by the FE stay unchanged (`GET /forecast*`, `/voice`, `/credit-package`, `/question/:id/audio`, `/vocabulary-suggestion/approved` and `/:id/audio`, all `speaking-session`, `attempt`, `payment`, `file`, `voice-room`, `account/me`, `auth`).

| Change | FE action |
| :--- | :--- |
| Foreign resources: 403 ⇒ 404 | check whether the FE special-cases 403 (not verified) |
| `Idempotency-Key` on `POST /attempt`, `POST /payment` | add the header (optional at first) |
| Voice room: server sets sender name and avatar | none (extra fields ignored) |
| `/account/me` still returns `balance` | none |
| Socket event names and shapes | none |

## 11. Findings from the code audit (evidence, for verification)

"Verified" means observed by reading or running a tool, not confirmed by the owner.

### 11.1 Incorrect or risky code

| # | Finding | Evidence |
| :--- | :--- | :--- |
| F1 | about 40 `.populate()` calls reach into another module's collections (attempt → file, forecast-question; account → file; voice → file; generated-audio → file; forecast → file; voice-room → account, file, question; vocabulary-suggestion → question) | `grep -rn populate src/modules` |
| F2 | PayOS webhook controller catches every error and always returns success, so a processing failure is never retried | `payment/payment.controller.ts:17` |
| F3 | `username` is the part of the email before `@` and is unique; a second user with the same local part cannot register, and `verifyRegister` turns the error into a generic 500 | `account/account.service.ts:58`, `auth/services/auth.service.ts` (`verifyRegister`) |
| F4 | "Recent sessions" query has no sort, so it returns the first sessions | `speaking-session/speaking-session.service.ts:186` |
| F5 | Practice charge records `refId = forecastQuestion.id`, not the attempt id | `attempt/attempt.service.ts:94` |
| F6 | Foreign resources return 403 with explicit messages | `attempt.service.ts:52,66,258,344`, `payment.service.ts:145` |
| F7 | Room PIN stored in plaintext, compared with `!==`, no attempt limit | `voice-room/voice-room.service.ts:228` |
| F8 | Circular dependencies hidden with `delay()` | `attempt.service.ts:34`, `generated-audio.service.ts:19` |
| F9 | A service imports another module's model | `voice-room.service.ts:33` (`Question`) |
| F10 | Worker concurrency is 1 and all scoring stages share one queue | `infrastructure/workers/consumers/base.consumer.ts:20` |
| F11 | One auth session per user (`userId` unique) | `session/session.model.ts:6` |
| F12 | Access-token cookie uses `sameSite: 'none'` in production, no CSRF defence | `auth/auth.controller.ts:95,102` |
| F13 | Admin routes without a permission check: `POST /credit-package`, `POST /forecast-question` (import), all vocabulary-suggestion routes, `PUT /voice/:id` | the `*.route.ts` files (re-verify each) |
| F14 | Two files register the Mongoose model `ForecastTopic` with different fields; only one is imported | `modules/forecast/forecast-topic.model.ts` (unused) vs `modules/forecast-topic/forecast-topic.model.ts` |
| F15 | 75 secondary indexes, 8 redundant by prefix (`Attempt{userId}`, `File{kind}`, `File{ownerId}`, `GeneratedAudio{normalizedText}`, `Question{part}`, `VocabularySuggestion{questionId}` ×2, `AccountProvider{accountId}`) plus a duplicate `Payment.orderCode` | schema script, §11.3 |
| F16 | `AzureSpeechProvider` interpolates text into SSML without XML escaping | `infrastructure/providers/tts/azure-speech.provider.ts` |
| F17 | `seed.ts` deletes collections and creates a super admin with a fixed password | `scripts/seed.ts` |
| F18 | Swagger globs point to paths that do not exist | `common/config/swagger.config.ts:36` |
| F19 | JWT signed with the default HS256 and a shared secret | `infrastructure/security/jwt-token.service.ts` |
| F20 | Upload runs ffmpeg and two Cloudinary uploads inside the HTTP request; temp names use `Date.now()` | `file/file.service.ts` |
| F21 | `SpeakingAnalysisService`: 12 constructor parameters, 7 `socketService.emit` calls, hard-coded provider and model names | `attempt/speaking-analysis.service.ts` |
| F22 | Credit deduct or grant plus ledger write copied in six places | `attempt.service`, `speaking-session.service` (charge, refund), `speaking-analysis.service` (refund), `payment.service`, `account.service` |
| F23 | Payment `CANCELED` is declared but never set; `EXPIRED` is only set when someone opens the payment | `payment/payment.constants.ts`, `payment.service.ts:146` |
| F24 | `AccountService.getList` reads the model directly without pagination; `getById` selects `+password` | `account/account.service.ts` |
| F25 | 23 functions over complexity 12, 12 over 70 lines, 8 with more than 5 parameters (worst: `evaluate` 30, `voice-room.mapper.toResponse` 35, `forecast-question.mapper.toResponse` 27) | ESLint run |
| F26 | AI vocabulary extraction costs an LLM call per qualifying attempt and its output is invisible until an admin approves it; no approval UI exists | `vocabulary-extraction.service.ts`, `vocabulary-suggestion.service.ts` |
| F27 | `.env.example` has no Redis variables and an empty `MONGODB_URI`; `docker-compose.dev.yaml` runs only `api` | repository files |
| F28 | `account.service` imports types from `auth/types`, which imports `account.validation` | `account/account.service.ts` |
| F29 | `REDIS_URL` is ignored: `getRedisOptions` puts it in a `url` key of the options object, but ioredis (5.10.1) parses a URL only when it is passed as a string argument and `RedisOptions` has no `url` option; a deployment that sets only `REDIS_URL` silently connects to the default host and port, without TLS | `common/config/redis.config.ts`, `infrastructure/redis/redis.factory.ts`, `node_modules/ioredis/built/Redis.js:621` |

### 11.2 Dead code (script and `tsc`, not confirmed by the owner)

- **Unused classes and exports:** `WinstonLogger` and the second logger definition (no consumer), `AzureSpeechProvider`, `DOMAIN_EVENTS` with the whole `event-bus` (6 files, nothing calls `publish`), eight constants in `validators.util.ts` (`EMAIL_RULE`, `PASSWORD_RULE`, `OTP_RULE`... used only inside that file), `baseQueryFields`, `permissionResSchema`, `seedData`.
- **Methods never called:** `FfmpegProvider.getDuration`, `convertAudio`; `CloudinaryStorageProvider.deleteFile`; `SocketService.joinUserToRoom`; `AccountService.resolveSelectedVoiceId`; `AttemptService.countCompletedAttempts`; `GeneratedAudioService.buildCacheKey` (duplicates private `_cacheKey`).
- **Registered but not referenced directly:** `Part1/2/3Question`, `AudioFile`, `ImageFile` (Mongoose discriminators; keep the registrations because question creation relies on them, §8; only the exports are unused).
- **Fields never read:** `Account.isSuperAdmin`, `Account.kind`, `Payment.webhookVerified`, `Payment.retryCount`, `CreditLog.descriptionKey` and `descriptionMetadata` (the FE reads only `description`).
- **Modules that are shells:** `mail`, `speech`.
- **Dependencies without an import:** `morgan`, `@types/morgan`, `edge-tts-node`, `msedge-tts`, `eventemitter2` (used only by the dead event bus).
- 19 unused locals (`tsc --noUnusedLocals`) and about 50 lines of commented-out code.

### 11.3 How the numbers were produced

- Complexity: `eslint --rule complexity=12, max-lines-per-function=70, max-params=5`.
- Unused code: `tsc --noEmit --noUnusedLocals --noUnusedParameters` and a script that lists exported symbols and methods referenced nowhere else.
- Indexes: a throw-away script that imports every `*.model.ts` and calls `schema.indexes()`.
- Module dependencies: a script that maps files to modules and counts imports (§2.5).
- Duplication (`jscpd`) was **not** measured; run `npx jscpd src --min-lines 8` locally.

## 12. Work breakdown

One ticket (GitHub issue) per step with the checklist below; each line is one small PR with CI green. Pure moves (`git mv`) are separate PRs from logic changes; bug-fix PRs are separate from refactor PRs. Branch and commit conventions follow `docs/plan/backlog.md`. The full test suite (backlog Phase 4) is written after R6; R0 builds only a small safety net.

**R0 Foundation (size M)**
1. `main/api.ts`, `main/worker.ts`, `createApp()`, `ROLE=api|worker`; route files stop resolving the container at import time.
2. Logger (§6.2): JSON, `requestId`, redaction; error middleware logs 5xx; request id copied into job data.
3. `/health`, `/ready`, `trust proxy` from env, graceful shutdown with timeout, `unhandledRejection`; Mongo options; timeouts on external calls (SEC-4).
4. `config/` split (§6.1), `.env.example` complete, `.env.test`.
5. Dockerfile fixes (port from env, `HEALTHCHECK`, workspace file).
6. Test harness (vitest, supertest, in-memory Mongo replica set) and about 10 API tests: login, parallel charge, webhook twice, practice submit twice, one admin 403.
7. Light CI (lint, typecheck, build, gitleaks); `dependency-cruiser` in warn mode.

**R1 Clean-up and bug fixes, no structural change (size S–M)**
1. Webhook semantics (F2); unique username and clear registration errors (F3); sort of recent sessions (F4).
2. Delete dead code and dependencies (§11.2), the duplicate model (F14), Swagger or fix its globs (F18).
3. Drop redundant indexes (F15); `console.*` to logger; `no-explicit-any` as an error for new code with a ratchet baseline.
4. Seed split (§6.5): `seed:reference` idempotent, `seed:demo` refuses production, admin password from env (F17).
5. AI vocabulary extraction behind a flag, off by default (F26).
6. Small security items: `getById` must not select `+password`, `getList` through the repository with pagination (F24); temp file names with `randomUUID()` (F20); escape SSML text (F16).

**R2 Folder moves, mechanical (size M)**
1. Create `core/`, `config/`, `main/`; move `common/` and `infrastructure/` per §2.4 (one PR per group: persistence, http and middlewares, queue, cache and redis, security, logging, realtime).
2. Move module folders into the ten modules (one PR per module): `account` (+`access/`), `auth`, `content`, `practice`, `assessment`, `billing`, `file`, `tts`, `voice-room`, `notification`.
3. Business code leaves `core/`: speaking jobs to `practice/jobs`, mail to `notification`, LiveKit to `voice-room`, providers to their modules.
4. Every PR: `tsc` and build green, R0 tests green, no logic change.

**R3 Account, auth and admin API (size L)**
1. `account.getAccountForLogin`; move profile types and schemas into `account` (F28); `auth` stops touching `Group` and `Permission`.
2. Split `AuthService` into credential, session and social-login services; `auth` calls `notification.sendOtp`.
3. `/api/v1/admin/*` router with guard and audit log; move admin routes (§10); route-walking test; add the missing permissions (F13).
4. `assertOwner` helper: foreign resources return 404 (F6); apply to attempt, mock test, payment, file; tests assert 404.
5. Rate limits (§6.3), OTP lockout after 5 wrong tries, limiter key; cookie `sameSite` and CSRF decision (F12).
6. Only if needed (§15): multiple sessions per user (F11) and `permissionsVersion`.

**R4 Billing (size M)**
1. `wallets`, `WalletService` (`charge`, `refund`, `grant`, `getBalance`, `quote`) with the unique ledger index; script to copy `balance`; remove `addBalance` and `deductBalance` from account.
2. Replace the six duplicated blocks (F22); practice `refId = attemptId` (F5); pricing moves here; `/account/me` composes the balance.
3. Payment transition table, expiry job, raw webhook payload, decision on `CANCELED` (F23).
4. Concurrency tests: parallel charge, double refund, duplicate webhook.

**R5 Practice and assessment (size L)**
1. `SubmitAnswerService`; remove both `delay()` calls (F8); `Idempotency-Key`; `questionSnapshot` on attempts.
2. `assessment.submit`, `AssessmentListener` (defined in `assessment`, implemented in `practice`), `assessment.getResult`; the stage runner no longer imports account, billing, socket or practice (F21).
3. Practice listener: apply results, `Notifier`, refund on failure, mock-test aggregation.
4. Transition tables for Attempt and MockTest; reconciler job; move `INSTRUCTION_SCRIPTS` into `tts` and pricing names into `billing` (cycles §2.5).
5. `Notifier` replaces the 7 direct emits (in-app channel of `notification`).

**R6 Content, tts, file, voice-room (size M–L)**
1. `tts`: `TtsProvider` interface, `TTS_PROVIDER`, Azure default; move `generateAndSaveAudio` into `tts`; remove the voice ↔ generated-audio cycle.
2. `file`: `getAudioForOwner`, `storeAudio`; ffmpeg as an adapter.
3. `content`: `public.ts`; remove cross-module imports and the `populate` calls of F1 (ports or snapshots; map in controller or mapper where only display data is needed).
4. `voice-room`: split the service; PIN hash and attempt limit; pinned-question snapshot; chat membership check; sender from the server.

**R7 Conventions, cache, monitoring, documentation (size M)**
1. ESLint rules of §5; `dependency-cruiser` from warn to error; CI step that boots each `ROLE`.
2. Cache for forecasts, credit packages, voices, approved vocabulary (§6.4); `/metrics`; error tracker.
3. Numbered `docs/` layout, ADRs for the decisions in §3 and §14, update `CLAUDE.md` and the flow docs.

Order: R0 → R1 → R2 → (R3 ∥ R4) → R5 → R6 → R7.

## 13. Acceptance criteria

- `dependency-cruiser` reports no import into another module except its `public.ts`, no cycle, nothing in `core/` or `config/` importing `modules/`.
- No `.populate()` targets another module's model.
- Every admin route is under `/api/v1/admin/*` and declares a permission; a test enforces it.
- Credit logic exists only in `billing`; ledger entries are unique per `(accountId, refType, refId, type)`.
- Payment, Attempt and MockTest transitions go through a transition function and are covered by tests.
- No `console.*`, no unused exports or methods listed in §11.2, no `session: any`.
- The logger writes a `requestId` in every line, including scoring jobs; `/health` and `/ready` work.
- Each `ROLE` boots on its own in CI; the R0 tests plus the concurrency tests of R4 pass.

## 14. Relationship to `architecture_roadmap.md`

The roadmap is the long-term target (Spring Boot for Auth, Content, Practice, Payment; Node for the rest). This spec is its Phase 1 in spirit (clean modules, no cross-module access) but differs on purpose:

| Roadmap | This spec |
| :--- | :--- |
| Services: Auth & Account, Content & Bank, Practice & Mock, Payment & Credit, Voice Room, Speech, File & Storage, Notification | `account` + `auth`, `content`, `practice`, `billing`, `voice-room`, `assessment` + `tts` (the roadmap's single Speech service, kept as two modules because they change for different reasons and can be merged when split), `file`, `notification` |
| Rule 1: no cross-module `.populate()` | adopted, enforced by `dependency-cruiser` |
| Rule 2: cross-module calls through interfaces; asynchronous work through the event bus with a transactional outbox | calls through `public.ts`; **no event bus and no outbox for now** (§3); `speprove-be/CLAUDE.md` rule 2 must be edited when this spec is accepted |
| Rule 3: DTO and mapper at boundaries | adopted: public functions take and return DTOs |
| Phase 1: asymmetric JWT, RabbitMQ, outbox | deferred (§16) |

`AGENTS.md`, `docs/01-introduction/01-system-overview.md` and the two flow docs (`01-ai-scoring.md`, `02-payment-and-credit.md`) must be updated in the same change that implements R5 and R4. Until the owner accepts this spec, `AGENTS.md` stays as written.

## 15. Open decisions and unverified claims

**Owner decisions**
1. Event bus and outbox: this spec drops them for now; the roadmap and `CLAUDE.md` say otherwise.
2. Will the CMS manage roles and permissions? (This spec assumes yes and keeps the permission tables.)
3. Is there an Android client? (Decides multiple sessions per user and how tokens are returned.)
4. Is the repository public? (SonarCloud free tier; not verified.)
5. AI vocabulary extraction: keep switched off, or delete?
6. Which Mongo and Redis providers are used? (Limits and BullMQ settings must be checked.)

**Not verified (check before relying on them)**
- Whether `.env` points at a cloud database (then `seed` would wipe it).
- Whether PayOS sends a webhook when a user cancels (decides whether `CANCELED` is kept).
- Whether the FE handles status 403 specially, and whether it uses the credit-log `description`.
- How the FE reaches the API in production (same origin through the Next.js rewrite, or direct); decides cookie `sameSite` and CSRF handling.
- The value of `ACCESS_TOKEN_LIFE`.
- How to decide that a user is a room participant for the chat socket room (LiveKit participants or a database record).
- That no other admin route lacks a permission check (the route-walking test is the proof).
- Azure TTS: that the seeded voice names work with it, its current price, and how it behaves with the same output format.
- Keycloak details (only the design direction is given here).
- Duplication percentage (`jscpd` not run).

## 16. Deferred (only when a module is actually split)

Recorded so they are not forgotten; none is part of this refactor:

- Event bus, transactional outbox, RabbitMQ, idempotent listeners keyed by `eventId`, a fixed message envelope.
- RS256/ES256 signing with a JWKS endpoint and a session blocklist (the interface `ITokenService` already isolates the token implementation).
- gRPC, API gateway, service discovery, OpenTelemetry tracing.
- Per-module databases and PostgreSQL (roadmap Phases 2 and 4).
- Self-hosted TTS.
- OpenAPI generated from zod and FE types generated from it.
- Replacing `auth` by an identity provider.

## 17. References inside the repo

- `architecture_roadmap.md` (workspace folder): long-term target and module rules.
- [Backlog](../../plan/backlog.md): phases for CI/CD, tests, performance, scoring v2.
- [Scoring pipeline v2](../scoring-pipeline-v2/design.md): will replace the internals of `assessment`.
- LanceVia (`GOS-Training/demo-2/lancevia-backend/docs`): reference for the ownership-returns-404 rule, concurrency-test style, CI stages and the numbered docs layout. Its distributed locks, Eureka, Keycloak and RabbitMQ parts are not adopted.
