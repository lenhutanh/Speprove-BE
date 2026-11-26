# Backlog

> Work plan until the thesis defense. Cross-repo epics live here (BE repo). Rubric references (TC…, G…) point to `rubric.txt` in the workspace folder.
> Architecture details for E1–E7 and E10–E12 are in [`specs/architecture-refactor/design.md`](../specs/architecture-refactor/design.md) (draft, pending owner verification). Measured starting point: [baseline](./baseline-2026-11-22.md).

## Progress Board (2026-11-26)

The board is the source of truth for the **order** and the **status** of the tickets. The epics and checklists further down are the original plan and keep the detail of each epic; where they disagree with the board, the board wins. The state of the work and the next step are in [handoff.md](./handoff.md); known weaknesses and their impact are in [technical-debt.md](./technical-debt.md).

Kinds: **spec** means a spec of three files in [`../specs/`](../specs/) approved before coding; **tasks** means a task list with acceptance criteria, approved in chat before coding, no spec file; **docs** means a documentation ticket. Each spec is written just in time and needs the owner's approval before code. Status: `done`, `owner check` (waiting for a manual check of the owner), `todo`.

**Rules of the order.** Refactor is a must. If time runs out, cut friend, chat, call and the scope of scoring v2 first. Tests are written inside each ticket (tests of the current behavior first, then the change, then tests of any intended change of behavior). Every refactor step leaves the system working, so the work can stop after any step.

| # | Ticket (branch) | Repo | Kind | Status |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `chore/upgrade-deps` | BE, FE | tasks | done and pushed; not merged. Not checked: running the app with the new dependency versions |
| 2 | `chore/clean-workspace` (FE) | FE | tasks | partial: lint reports untracked. Open: the stray folder (gone with a fresh clone on Linux) and the uncommitted `src/messages/vi.d.json.ts` |
| 3 | `docs/project-docs` | BE, FE | docs | done; BE pushed, FE local only |
| 4 | `feat/app-foundation` | BE | spec: [app-foundation](../specs/app-foundation/) | code done, pushed; owner check pending (task 3c.6) |
| 5 | `chore/remove-dead-code` | BE | tasks | code done, pushed; owner check pending (start the app, `/health`, login, one practice) |
| 6 | `docs/reference-docs` | BE | docs | done locally, not pushed: reference documents, `AGENTS.md` table, refactor design decisions |
| 7 | Settle the branches: reinstall `node_modules` on Linux, run test, build and lint, owner checks, chained pull requests, merge | BE, FE | tasks | todo |
| 8 | `chore/measure-baseline` (duplication, lint, tests, coverage) | BE | tasks | todo |
| 9 | `ci/quality-gates` (coverage, frontend CI, Dependabot, static analysis, image scan, branch protection) | BE, FE | tasks | todo |
| 10 | `ci-cd-staging` (pipeline, deploy, rollback, health check, deploy history) | BE, FE | spec | todo. Needs the owner's decisions: staging host, registry, secrets, trigger |
| 11 | `refactor/module-layout` (`core/`, ten modules, `public.ts`, dependency check; one pull request per group) | BE | spec | todo |
| 12 | `refactor/account-auth` (split `AuthService`, `assertOwner`, admin routes and permissions, rate limits, OTP lockout) with `fix/route-permissions` | BE, FE | spec | todo |
| 13 | `refactor/billing` (`WalletService`, one credit path, payment states, expiry job) with `fix/webhook-and-http-errors` | BE | spec | todo |
| 14 | `refactor/practice-assessment` (`assessment` as its own module, listener, reconciler, safe enqueue, scoring retry policy) | BE, FE | spec | todo |
| 15 | `refactor/content-tts-file` (voice catalog in `content`, `tts` capability, safe upload, TTS cache lock) with `fix/resilience` | BE | spec | todo |
| 16 | `refactor/voice-room` | BE | spec | todo |
| 17 | `refactor/conventions-cache-metrics` (lint rules, dependency check as an error, cache, `/metrics`) and `chore/seed-split` | BE | tasks | todo |
| 18 | `fix/demo-path` (edge cases of mock test, frontend `error.tsx` and `loading.tsx`) | BE, FE | tasks | todo |
| 19 | `test/load-k6` (staging with fake providers) and the measured values for the NFRs | BE | tasks | todo |
| 20 | `docs/design-docs` (diagrams that match the code after the refactor, NFR numbers) | BE | docs | todo |
| 21 | `docs/scoring-v2-design` (rewrite the design: no training, the LLM scores from measured evidence), then `feat/audio-quality-gate`, `feat/speech-features`, `feat/gop-pronunciation`, `feat/evidence-based-scoring` | BE, SV | spec | todo |
| 22 | `feat/friend`, `feat/chat`, `feat/call` (reuse the old branches as reference) | BE, FE | spec | todo |
| 23 | `feat/observability-metrics` | BE | tasks | todo |

The owner handles in parallel: the product commitment, the AI usage log, the survey, recruiting people for user testing, thesis writing and the defense. User testing needs staging (row 10) and a stable product. Documents of the nine domains in [layout-and-index.md](../layout-and-index.md) are written in the ticket that creates their content.

## Conventions

- **Epic = one GitHub issue with a checklist. Each checklist line = one small PR** (one branch, CI green). Pure moves (`git mv`) are separate PRs from logic changes; bug fixes are separate from refactors.
- **Branch:** `<type>/<short-name>` with `type` ∈ `feat`, `fix`, `chore`, `ci`, `test`, `perf`, `refactor`, `docs`, `research`. Branch off `main`.
- **Commit:** Conventional Commits with a scope, e.g. `fix(payment): return 500 when webhook processing fails (E2)`.
- **PR:** title `[E2] Return 500 when webhook processing fails`; the body lists the checklist line's acceptance criteria. Merge only when CI is green (once CI exists).
- **Repo:** `BE` = speprove-be, `FE` = speprove-fe, `TS` = speprove-testing, `SV` = services/ (Python).
- **Status:** `todo` / `doing` / `done`; update it in the PR that finishes the epic.

## Windows

The date of the defense is not set; the earlier assumption (2 to 3 weeks from 2026-11-22) no longer holds and the owner has said that only a few days remain. The order of the board is therefore the cut order: stop after any row and the product is still working. What is cut first: friend, chat, call, then the scope of scoring v2. Refactor is not cut. The first rows (7 to 10) exist because the rubric caps the grade without a running pipeline (G6), tests (G5) and user testing (G7).

## Epics

| ID | Branch prefix | Repo | Epic | Window | Depends | Rubric | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| E0 | `chore/` | BE, FE | Prepare: git clean-up, local dependencies, baseline | Before | — | — | doing |
| E1 | `chore/`, `feat/` | BE | Foundation: logger, request id, health, config, test safety net | Before | E0 | TC2.4, TC2.6 | todo |
| E2 | `fix/`, `chore/` | BE | Clean-up and bug fixes without structural change | Before | E1 | TC2.4 | todo |
| E3 | `ci/`, `chore/` | BE, FE | Staging and CI/CD | Before (start first) | E1 | G6, TC2.6, TC2.2 | todo |
| E4 | `test/` | BE | Core tests and coverage | Before | E1 | G5, TC2.5 | todo |
| E8 | — | — | User testing (≥ 5 people, SUS, one improvement round) | Before (recruit from week 1) | E3 | G7, TC2.7 | todo |
| E9 | `docs/` | BE | Documentation and thesis material (owner-led) | Before | — | TC1, TC2.1, TC3, TC4 | todo |
| E5 | `refactor/` | BE | Folder moves into ten modules and `core/` | If time | E2 | TC2.4 | todo |
| E6 | `refactor/`, `fix/` | BE, FE | Account, auth and admin API | If time | E5 | TC2.4 | todo |
| E7 | `refactor/` | BE | Billing: wallet and ledger | If time | E5 | TC2.4 | todo |
| E13 | `fix/`, `feat/` | BE, FE | Finish current features: mock-test edge cases, FE hardening | Partly before | E2 | TC2.2 | todo |
| E10 | `refactor/` | BE | Practice and assessment split | After | E5, E7 | TC2.4 | todo |
| E11 | `refactor/` | BE | Content, tts, file, voice-room | After | E5 | TC2.4 | todo |
| E12 | `feat/`, `docs/` | BE | Cache, metrics, error tracking, architecture docs | After | E11 | TC2.1 | todo |
| E14 | `feat/` | BE, FE | New features: friends → chat → notification → calls | After | E10, E11 | — | todo |
| E15 | `feat/`, `research/` | BE, SV, FE | Scoring pipeline v2 | After, last | E14 | TC4, TC6 | todo |

Owner-managed and not assigned to the assistant: the product commitment (gate G1), the weekly progress log (G2), the AI usage log (G3), the survey, thesis writing, slides and defense preparation.

## E0 Prepare (doing)

- [x] `.env.example` lists every variable of the env schema.
- [x] `docker-compose.dev.yaml`: the API container now listens on the port it publishes (8017; the app used to listen on 5000).
- [x] Node pinned to 24 (`.nvmrc`, both Dockerfiles); Node 20 reached end of life on 2026-04-30.
- [x] Dependency vulnerabilities fixed in the lockfiles (BE 80 → 2 moderate in dev tooling, FE 79 → 0, `next` 16.4.6); see the baseline. `pnpm audit` is run by hand and becomes a CI step in E3.
- [ ] Enable "Dependabot alerts" in the GitHub settings of both repositories; run `pnpm install` on each operating system; smoke-test auth, upload, payment, sockets and voice rooms with the new versions; update the local Node to the latest 24.x.
- [x] Baseline numbers recorded ([baseline](./baseline-2026-11-22.md)).
- [ ] Merge or close `feat/voice-room-settings` in BE and FE so that `main` is the base.
- [ ] Decide the fate of `feature/chat`, `feature/friend`, `feature/call`, `feature/refactor-prisma`, `anh_dev`, `backup/wip-chat-friend`, `dev` (merge, rebase after E5, or close) and agree a freeze window for the folder moves.
- [ ] Commit `CLAUDE.md` and `docs/` on a `docs/` branch off `main`.
- [ ] Run `pnpm install` on the current operating system; check where `.env` points before running any seed (the current seed deletes collections).
- [ ] Optional: run the `speprove-testing` suite against local and record the result.

## E1 Foundation (spec R0)

- [x] `createApp()` in `src/app.ts`; route files and `rateLimitMiddleware` no longer resolve the container at import time (`authMiddleware` in `auth.middleware.ts` resolves per request).
- [ ] `ROLE=api|worker` and `main/worker.ts`: blocked until the worker can reach Socket.io from another process. Today `SocketService.emit` silently does nothing without the in-process `io`, so a separate worker would lose all scoring progress events. Needs `@socket.io/redis-adapter` or `redis-emitter` first.
- [x] One JSON logger; `requestId` in every line, in error responses and in BullMQ job data; redaction; 5xx always logged. (76 `console.*` calls replaced, two unused logger implementations removed; `src/scripts/` keeps `console` for CLI output.)
- [x] `/health` and `/ready` (Mongo and Redis), `trust proxy` from env, graceful shutdown with a timeout, `unhandledRejection`; Mongo options (`serverSelectionTimeoutMS`, `maxPoolSize`).
- [x] Timeouts from config on Groq, LiveKit, PayOS and the audio download (old SEC-4). Not covered: the Azure Speech SDK recognizer and the Brevo and Cloudinary SDKs (no timeout option checked yet).
- [x] Third-party keys optional in `NODE_ENV=test`; `APP_PORT` default fixed; `REDIS_URL` honoured. Test environment lives in `vitest.config.mts` instead of `.env.test`. Not done: splitting the config file by concern.
- [x] Dockerfile: `HEALTHCHECK` (reads `PORT` then `APP_PORT`), copy `pnpm-workspace.yaml`. The `EXPOSE 8017` line stays, it is documentation only. Not verified by an image build (disk space).
- [x] Test harness (vitest with SWC, supertest, in-memory Mongo replica set) and 13 API tests: health, ready, request id, 401, 403, 404, login (4), parallel deduction, webhook twice, webhook with a wrong amount. Not done: practice submit twice (needs the queue and attempt flow).
- [x] Light CI (`.github/workflows/ci.yml`): lint, build, test, `pnpm audit --audit-level=high`, gitleaks. Not done: `dependency-cruiser` (needs each module's `public.ts`, so it moves to E5). Not run on GitHub yet.

## E2 Clean-up and bug fixes (spec R1)

- [ ] Webhook: invalid signature ⇒ 400, processing error ⇒ 500, already processed ⇒ 200 (design F2).
- [ ] Unique username and clear registration errors; `verifyRegister` stops turning every error into a 500 (F3).
- [ ] Sort the "recent sessions" query (F4).
- [ ] Redis client honours `REDIS_URL` (string argument, TLS for `rediss://`) (F29).
- [ ] Delete dead code and dependencies (design §11.2), the duplicate `ForecastTopic` model, the unused `EventBus`, Swagger (or fix its globs).
- [ ] Drop redundant indexes in code and run `syncIndexes` on each database (design F15).
- [ ] `console.*` to the logger; `no-explicit-any` as an error for new code with a ratchet baseline.
- [ ] Seed: `seed:reference` (idempotent) and `seed:demo` (development only, admin password from env).
- [ ] AI vocabulary extraction behind a flag, off by default.
- [ ] `getById` no longer selects `+password`; `getList` goes through the repository with pagination; upload temp names use `randomUUID()`; escape SSML text in the Azure TTS provider.

## E3 Staging and CI/CD

- [ ] Staging environment reachable from outside: BE and FE images, managed MongoDB and Redis (one database and account per environment), secrets in GitHub Environments.
- [ ] GitHub Actions for BE and FE: install → lint and typecheck → test with coverage → gitleaks and dependency audit → image scan → Docker build and push (tag = git SHA) → deploy to staging → health check.
- [ ] Rollback by redeploying the previous SHA (documented script); deploy on merge to `main`.
- [ ] Uptime check on `/health` with an alert; logs collected in one place.
- [ ] Record the deployment history (rubric asks for at least 5 automatic deployments, build success rate ≥ 80%, staging in 30 minutes or less).

## E4 Core tests and coverage

- [ ] Credit: parallel charge, double refund, balance never negative.
- [ ] Payment webhook: bad signature, amount mismatch, duplicate, non-pending payment.
- [ ] Authorization: every admin route returns 403 without permission (route-walking test); foreign resources return the agreed status.
- [ ] Auth: OTP lockout, login, refresh.
- [ ] Band aggregation (`scoreSession`) including half-band rounding.
- [ ] Coverage report for the core modules (target ≥ 50%, stretch 70%); CI runs the tests and publishes the report.
- [ ] Test plan with a traceability table (test case → acceptance criterion); bug tracker = GitHub Issues with labels.

## E8 User testing

- [ ] Test plan: task scenarios, metrics (completion rate, SUS), consent form, anonymous participant list.
- [ ] Recruit at least 5 target users (aim for 10) from week 1; run round 1 in week 2.
- [ ] Record results and open an improvement issue for each finding.
- [ ] Ship the improvements and measure again; before/after comparison.

## E9 Documentation and thesis material (owner-led)

- [ ] Survey (≥ 30 forms or 3 stakeholders), comparison with at least 3 existing products, at least 5 KPIs (TC1).
- [ ] User stories with acceptance criteria, at least four diagram types matching the code, at least five quantified non-functional requirements (TC2.1).
- [ ] Technical-debt register: `docs/specs/architecture-refactor/design.md` is the starting point (TC2.4).
- [ ] README with setup, environment and deployment; thesis chapters; slides; demo rehearsal.

## E5 Folder moves (spec R2) — if time

- [ ] Create `core/`, `config/`, `main/`; move `common/` and `infrastructure/` per design §2.4 (one PR per group).
- [ ] Move module folders into `account`, `auth`, `content`, `practice`, `assessment`, `billing`, `file`, `tts`, `voice-room`, `notification` (one PR per module).
- [ ] Business code leaves `core/`: speaking jobs to `practice`, mail to `notification`, LiveKit to `voice-room`, providers to their modules.
- [ ] Every PR: `tsc`, build and the E1 tests green, no logic change.

## E6 Account, auth and admin API (spec R3) — if time

- [ ] `account.getAccountForLogin`; move profile types into `account` (design F28).
- [ ] Split `AuthService` into credential, session and social-login services; `auth` calls `notification.sendOtp`.
- [ ] `/api/v1/admin/*` router with guard and audit log; move the admin routes; add the missing permissions (design F13); route-walking test.
- [ ] `assertOwner` helper: foreign resources return 404; tests.
- [ ] Rate limits on registration, OTP, upload, attempt and payment creation; OTP lockout after 5 wrong tries; limiter key.
- [ ] Cookie `sameSite` and CSRF decision.
- [ ] Only if needed: multiple sessions per user, `permissionsVersion`.

## E7 Billing (spec R4) — if time

- [ ] `wallets` and `WalletService` (`charge`, `refund`, `grant`, `getBalance`, `quote`) with a unique ledger index; copy script for `balance`; `/account/me` still returns `balance`.
- [ ] Replace the six duplicated credit blocks; practice charge uses the attempt id as `refId`.
- [ ] Payment transition table, expiry job, raw webhook payload, decision on `CANCELED`.
- [ ] Concurrency tests.

## E13 Finish current features

- [ ] List and fix mock-test edge cases: disconnect or refresh in the middle, double submit, timer expiry, partial sessions, retry never pressed.
- [ ] Background jobs: expire overdue payments; refund attempts that failed and were never retried after N hours (reconciler).
- [ ] FE: `error.tsx`, `global-error.tsx`, `loading.tsx`, StrictMode back on, remove junk files, handle 404 for foreign resources, send `Idempotency-Key`.

## After the defense

- **E10** Practice and assessment split (`SubmitAnswerService`, `AssessmentListener`, transition tables, reconciler) — spec R5.
- **E11** Content, tts (`TtsProvider`, Azure default), file, voice-room (service split, PIN hash, snapshots) — spec R6.
- **E12** Cache for forecasts, packages, voices and approved vocabulary; `/metrics`; error tracker; numbered docs and ADRs; update `CLAUDE.md` and the flow docs — spec R7.
- **E14** Friends → chat 1-1 → notification module (email and in-app first, then push) → calls. The old branches `feature/friend`, `feature/chat`, `feature/call` are single July commits without an FE and must be rebased on the new structure.
- **E15** Scoring pipeline v2: quality gate, GOP replacing Azure, feature extraction, LLM scoring against the IELTS descriptors with measured evidence, label-free validation. Design: [`specs/scoring-pipeline-v2/design.md`](../specs/scoring-pipeline-v2/design.md), which still describes the earlier trained-model plan and must be updated first.
- Performance work (k6 baseline, API/worker split, Socket.io Redis adapter) is not scheduled; record it as future work.

## Mapping from the earlier backlog

| Old ID | Now |
| :--- | :--- |
| SEC-1, SEC-2, SEC-3 | E6 (E1 for the limiter key if done earlier) |
| SEC-4 | E1 |
| SEC-5 | E11 |
| SEC-6, SEC-7 | E2 |
| OPS-1, OPS-2, OPS-3 | E1 |
| OPS-4 | E13 |
| CI-1, CI-2, CD-1, CD-2, CD-3 | E3 |
| TEST-1 | E1 |
| TEST-2 … TEST-7 | E4 |
| MOCK-1 … MOCK-3 | E13 |
| PERF-1 … PERF-7 | not scheduled |
| UX-1 … UX-3 | E8 |
| DATA-1, DATA-2 | dropped (no model training, see the scoring memory in the spec) |
| SCR-0 … SCR-10 | E15 |
| DOC-1 … DOC-5 | E9, E12 |
| PRC-1, PRC-2 | owner-managed |
