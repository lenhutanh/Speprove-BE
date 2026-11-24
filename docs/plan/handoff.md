# Handoff (2026-11-23)

Context for whoever continues this work (for example Claude Code on another machine). The previous chat history is not available there; this file and `docs/plan/backlog.md` are the source of truth.

## Working agreement with the owner

- Ask before changing code: show what will change and how, then wait for approval. Review first, edit after.
- Stay inside the current ticket. One ticket is one branch; keep commits few and by topic.
- Commits stay local. The owner pushes and opens the pull requests.
- Clean code and security first: no redundant comments (only comments that explain a non-obvious reason), no unrelated reformatting (do not run Prettier over files that are not part of the change), no dead code.
- Never read `.env`, never run `pnpm db:seed` (it deletes data in whatever database `.env` points to), never touch cloud databases.
- Docs and specs are written in English. Chat with the owner is in Vietnamese.
- Back claims with evidence (documentation, a command output). Say plainly when something was not verified.

## Branches (all local, nothing pushed)

| Repo | Branch | Commits | Based on |
| :--- | :--- | :--- | :--- |
| `speprove-be` | `chore/upgrade-deps` | `fd13dbd` dependency vulnerabilities and Node 24; `5591502` container port and `.env.example` | `origin/main` |
| `speprove-be` | `feat/app-foundation` | `3db0e35` createApp, logging, health, shutdown, config, timeouts; `42fb4fc` tests and CI | `chore/upgrade-deps` |
| `speprove-fe` | `chore/upgrade-deps` | `3b69ac8` dependency vulnerabilities (Next.js 16.4.6) and Node 24 | `origin/main` |

Push order: `chore/upgrade-deps` first (BE and FE), then `feat/app-foundation` with `chore/upgrade-deps` as its base.

`backup/app-foundation-before-squash` (BE) holds the earlier nine-commit version of `feat/app-foundation`; delete it when it is no longer needed.

## Not committed (in the working tree)

- `docs/` (refactor design, backlog, baseline, this file), `CLAUDE.md` in both repos, the rename `project_overview.md` to `docs/architecture/overview.md` (BE) and `PROJECT_OVERVIEW.md` (FE). Commit them with the first refactor pull request, after the owner approves the spec.
- FE `src/messages/vi.d.json.ts` shows 474 changed lines that are not part of this work (probably generated). Check it and revert if it is not wanted.

## Open items in the current ticket (`feat/app-foundation`)

1. `/health` and `/ready` are mounted before `helmet()` in `src/app.ts`, so they lack the security headers and expose `X-Powered-By`. Fix: mount the health router after `helmet()`; add a test.
2. Log lines from the long-lived Redis clients carry the `requestId` of the request that created them (the client is created lazily inside a request, so it inherits the async context). Fix: add `runOutsideRequest()` to `request-context.ts` and create the clients with it in `redis.factory.ts`; add a test.
3. Not checked yet: the exit code on SIGTERM and SIGINT (expected 0), and a real run against the owner's cloud `.env` (login, practice an answer and wait for the score, voice room, Ctrl+C).

Acceptance run on 2026-11-22 against the real built app (temporary in-memory MongoDB and Redis): 13 of 14 checks passed; the failing one is item 1. Redis outage and recovery behaved correctly (`/ready` 503 then 200, `/health` stayed 200).

## Running on Windows

- Delete `node_modules` in both repos and run `pnpm install` again (the current ones were installed on Linux: native packages such as `bcrypt`, `@swc/core` and `esbuild` are Linux builds).
- Use Node 24 (`.nvmrc`).
- Check `git status` for line-ending noise (`core.autocrlf`).
- `pnpm test` downloads a MongoDB binary for the platform on first use. On Linux set `MONGOMS_DOWNLOAD_DIR` to a folder with free space.

## Where things are

- `docs/plan/backlog.md`: epics E0 to E15 with checklists. E1 is done except the open items above; next is E2 (clean-up and bug fixes, seed split).
- `docs/specs/architecture-refactor/design.md`: the refactor design (draft, waiting for the owner's verification).
- `docs/plan/baseline-2026-11-22.md`: measured numbers before the refactor.
- `CLAUDE.md` in each repo: commands and rules.

## Known leftovers

- A `docker compose config` run once printed values from the owner's `.env` (including the access-token signing secret) into the chat log. Rotate that secret if it is used anywhere other than local development.
- `ROLE=worker` (separate worker process) is blocked: workers send scoring progress through the in-process Socket.io instance. It needs a Redis adapter or emitter first.
- `authMiddleware` in `auth.middleware.ts` is a lazy wrapper around the container; the cleaner fix (route factories) belongs to E5.
