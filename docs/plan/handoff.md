# Handoff (2026-11-26)

## 1. Purpose

State of the work for whoever continues it, for example on another machine or in a new Claude Code session. The earlier chat history and the memory of the assistant are not available there: this file, [backlog.md](./backlog.md) and the specs are the source of truth. Delete this file when the branches below are merged.

## 2. Read in This Order

2.1. `AGENTS.md` (commands, architecture, modularity rules, workflow).
2.2. [backlog.md](./backlog.md): the progress board (order and status of every ticket).
2.3. This file: the state of the branches, what waits for the owner, the next step.
2.4. The spec of the current ticket: [specs/app-foundation](../specs/app-foundation/) (`tasks.md` first).
2.5. [docs-update-guidelines.md](../docs-update-guidelines.md) before writing any document.

## 3. Working Agreement with the Owner

3.1. **Ask before changing.** Show the brief (what changes, in which files, how it is checked) and wait for an explicit "duyệt" or "làm đi". A question, a comment or an ambiguous reply is not approval. Reading, `grep`, `tsc --noEmit` and running tests are fine before approval; edits, commits, installs and branch switches are not.
3.2. **Spec-driven.** A feature or a change with design decisions has a spec (`requirements.md`, `design.md`, `tasks.md`) approved before code; small and mechanical tickets have a task list with acceptance criteria approved in chat. Write the test first and see it fail, then the fix.
3.3. **One decision at a time.** The owner gets lost when many threads are open. Keep answers short and finish one ticket before the next.
3.4. **Commits stay local.** The owner pushes and opens the pull requests. Do not rewrite history (no rebase, no amend) without asking; prefer a new commit or a merge. Do not use `--no-verify`.
3.5. **Only what is needed.** No over-engineering, no document written before its ticket, no redundant comments (only comments that explain a non-obvious reason), no unrelated reformatting.
3.6. **Never read `.env`, never run `pnpm db:seed`** (it deletes data in whatever database `.env` points to), never touch the cloud databases or run a delete command whose target you have not inspected.
3.7. **Language.** Documents and specs in English; chat with the owner in Vietnamese. Commits follow Conventional Commits with a scope and end with the attribution trailer the tool asks for.
3.8. **Docs follow code.** A statement is corrected by the pull request that makes it wrong, and every new document is registered in `layout-and-index.md`.

## 4. State of the Repositories

State checked on 2026-11-26. In the backend the four branches of section 4.1 are pushed to `origin`, but **no pull request is open and nothing is merged**; `docs/reference-docs` exists only locally. In the frontend `chore/upgrade-deps` is pushed and `docs/project-docs` is local only. `main` of the local clones is behind `origin/main` (BE by 2 commits, FE by 3): run `git fetch` first.

### 4.1. Backend (`speprove-be`)

| Branch | Based on | Commits | Content |
| :--- | :--- | :--- | :--- |
| `chore/upgrade-deps` | `origin/main` | 2 | Dependency vulnerabilities, Node 24, Docker port, `.env.example` |
| `docs/project-docs` | `chore/upgrade-deps` | 10 | Documentation layout and rules, `AGENTS.md`, `CLAUDE.md`, the specs, this handoff, the board |
| `feat/app-foundation` | `docs/project-docs` | 8 | `feat(app): add createApp` (runtime foundation), `test: add vitest` (tests and CI), then fixes: health behind helmet, Redis log context, LiveKit timeout, shutdown (extracted, then fixed), Docker port |
| `chore/remove-dead-code` | `feat/app-foundation` | 6 | Unused code, `redis`, event bus, Swagger, commented-out code |
| `docs/reference-docs` | `chore/remove-dead-code` | local only | Reference documents (coding standards, layers and modules, API conventions, error codes, testing, requirements, NFRs, diagrams, endpoint index, test plan, technical debt, CI/CD, setup, configuration, security, authentication, persistence, validation, queues, data dictionary); `AGENTS.md` table of documents; decisions in the refactor design (voice in `content`, `WalletService` before `wallets`, sub-folders per entity) |

4.1.1. The first four branches form **one straight line**, and `docs/reference-docs` sits on top of the last one, in this order: each contains all the commits of the previous ones, so `chore/remove-dead-code` contains everything. The history was made linear with a rebase on 2026-11-25; the tips before it are kept as `backup/linear-feat-app-foundation`, `backup/linear-remove-dead-code` and `backup/linear-docs-project-docs`. `feat/app-foundation` therefore has `AGENTS.md` and the documentation tasks of its spec can be done there.
4.1.2. Old local branches kept as reference or backup: `feature/friend`, `feature/chat`, `feature/call` (single commits from July, no frontend), `feature/refactor-prisma`, `backup/app-foundation-before-squash`, `backup/wip-chat-friend`, `anh_dev`, `dev`, `list`, `ls`.
4.1.3. The commits are named in the documents by their subject, not by their hash, because the hashes of the rebased branches change.

### 4.2. Frontend (`speprove-fe`)

| Branch | Based on | Commits | Content |
| :--- | :--- | :--- | :--- |
| `chore/upgrade-deps` | `origin/main` | 2 | Dependency vulnerabilities, Next.js 16.4.6, Node 24; lint reports no longer tracked |
| `docs/project-docs` | `chore/upgrade-deps` | 2 | `CLAUDE.md`, docs index and overview, relative UI guidelines link |

4.2.1. The two frontend branches also form a straight line (rebased on 2026-11-25; the previous tip of the docs branch is kept as `backup/linear-docs-project-docs`).
4.2.2. Uncommitted: `src/messages/vi.d.json.ts` (474 lines changed, generated by next-intl, not understood yet; do not commit it blindly).
4.2.3. On the Windows machine the frontend folder holds an NTFS entry whose name is the absolute Windows path of the frontend folder itself (with real backslashes and a colon). **Never delete it by that name: the path resolves to the repository itself.** It breaks `pnpm lint` (ESLint ENOENT), hangs `next build` and makes VS Code's `rg` spin. It is not in git and disappears with a fresh clone.

### 4.3. Push Order

4.3.1. In each repository push the branches of the line: `chore/upgrade-deps`, then `docs/project-docs`, then (BE only) `feat/app-foundation`, then `chore/remove-dead-code`, then `docs/reference-docs`.
4.3.2. Open one pull request per branch, **chained**: the base of each pull request is the previous branch of the line (the first one targets `main`), so that it shows only its own commits. Merge from the bottom with merge commits, not squash: a squash gives the following branches different commits and they would show duplicates. After the first merge GitHub moves the base of the next pull request to `main`.
4.3.3. The last branch is the complete state: test it once there (`pnpm test`, `pnpm lint`, `pnpm build`, then the manual checks of section 6) before merging anything.

## 5. Verified Numbers (BE, branch `chore/remove-dead-code`, 2026-11-25)

| Check | Result |
| :--- | :--- |
| `pnpm test` | 26 of 26 pass in 8 files (the `mongo-ping` test is flaky under parallel load) |
| `pnpm lint` | 0 errors, 211 warnings |
| `pnpm build` | exit code 0 |
| `tsc --noEmit --noUnusedLocals --noUnusedParameters` | 0 errors (19 before) |
| `pnpm audit --audit-level=high` | no high or critical; 1 moderate |
| FE `pnpm audit`, `pnpm type-check` | 0 vulnerabilities, 0 errors |
| Manual, owner, cloud Mongo and Redis | `/health` and `/ready` answer 200 with the helmet headers; `SIGINT` exits with code 0 |

Not verified: FE `pnpm build` and `pnpm lint` (blocked by the stray folder), the Docker image build, the CI workflow on GitHub (never run), the app running with the upgraded dependencies.

## 6. Waiting for the Owner

### 6.1. Manual Checks

6.1.1. Shutdown with a connected client (`app-foundation` task 3c.6): `pnpm build`, `node dist/index.js`, connect a Socket.io client (open the frontend), Ctrl+C; it finishes in about one second and `$LASTEXITCODE` is `0`.
6.1.2. `chore/remove-dead-code`: start the app, `/health` answers 200, log in, make one practice attempt.

### 6.2. Decisions

6.2.1. `app-foundation` task 11 (stop Redis, `/ready` answers 503): proposed to drop, the cloud Redis cannot be stopped and an automated test covers it.
6.2.2. `/health` and `/ready` are open in production, and `/ready` shows the state of Mongo and Redis and pings them on every call. Options: keep, rate limit `/ready`, or restrict it at the proxy (decided in the CI/CD ticket).
6.2.3. The unused `AUTHOR` setting in `env.config.ts` (it only served Swagger).
6.2.4. Date of the defense (not given; the backlog assumed 2 to 3 weeks from 2026-11-22).
6.2.5. Decided 2026-11-26: a `WalletService` over `account.balance` now; the `wallets` collection later, when `billing` gets its own database (refactor design, section 4.3).

## 7. Next Step

7.1. Order of work agreed on 2026-11-26. **Refactor is a must, not optional.** If time runs out, cut friend, chat, call and the scope of scoring v2 first.
7.2. Settle the open branches: reinstall `node_modules` on Linux (`pnpm install --frozen-lockfile`), run `pnpm test`, `pnpm build`, `pnpm lint` and record the numbers; the owner runs the manual checks of 6.1, opens the chained pull requests and merges from the bottom.
7.3. Gates and safety net: measure the baseline (duplication, lint, tests, coverage); CI quality gates (coverage, frontend CI, Dependabot, static analysis, image scan); staging with automatic deploy, health check and rollback (`ci-cd-staging`; ask the owner where staging runs, which registry, which secrets and which trigger, then write its spec).
7.4. Refactor, one ticket per step, each leaving the system working: `module-layout`, `account-auth`, `billing`, `practice-assessment`, `content-tts-file`, `voice-room`, then conventions, cache and metrics. The ten modules and the order are in the [refactor design](../specs/architecture-refactor/design.md). Tests are written inside each ticket: tests of the current behavior first, then the change, then tests of any intended change of behavior.
7.5. Fixes that ride with the refactor: webhook and HTTP errors, route permissions, a single credit path, a scoring retry policy (retry only transient errors), safe upload and enqueue, a reconciler for refunds. They are listed with their impact in the [technical debt register](./technical-debt.md).
7.6. Last: edge cases of the demo path, a k6 load test on staging with fake providers, then scoring pipeline v2 (its design is rewritten first), then friend, chat, call.
7.7. The owner handles, in parallel: the product commitment, the AI usage log, the survey, and recruiting people for user testing.

## 8. Known Leftovers

8.1. The three outdated statements of `AGENTS.md` (no test runner, the event bus, Swagger) are corrected in `docs/reference-docs`; they stay wrong on the branches below it until that branch is merged.
8.2. The routes of `account`, `forecast` and `group` have `hasPermission` checks commented out (finding F13); they are handled by `fix/route-permissions` and the `account-auth` refactor.
8.3. The payment webhook returns 200 for every error, including a bad signature (finding F2); handled by `fix/webhook-and-http-errors` and the `billing` refactor.
8.4. `ROLE=worker` (a separate worker process) is blocked: `SocketService.emit` does nothing without the in-process Socket.io server.
8.5. The scoring pipeline design (`specs/scoring-pipeline-v2/design.md`) still describes a trained model; the decision of 2026-11-20 is that an LLM scores each criterion from measured evidence, with no training.

## 9. Setting Up on Linux

9.1. Do not copy the folders or `node_modules` from Windows (native packages differ, and the frontend folder holds the stray entry). Push the branches and `git clone` both repositories into the Linux filesystem.
9.2. Node 24 (`.nvmrc`). Backend pnpm `10.26.2` (`packageManager`); the frontend has no `packageManager` field and was installed here with pnpm 12, so use the version that matches its `pnpm-lock.yaml`.
9.3. In each repository: `pnpm install --frozen-lockfile`.
9.4. Create `.env` by hand from `.env.example` (never commit it); the owner's development setup uses cloud MongoDB and Redis.
9.5. The first `pnpm test` downloads a MongoDB binary of about 780 MB (set `MONGOMS_DOWNLOAD_DIR` if the disk is small); later runs reuse it.
9.6. `gh auth login` to open pull requests. Keep `core.autocrlf` as `false`.
9.7. Use relative paths in commands and documents. A Windows absolute path written from Linux creates a folder with backslashes in its name (the likely origin of the stray entry).
9.8. Docker is needed only to build the images; the CI workflow (`.github/workflows/ci.yml` on `feat/app-foundation`) has never run.
