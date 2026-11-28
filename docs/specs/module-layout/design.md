# Module Layout: Design (Backend)

> Repository: `speprove-be`. Requirements: [requirements.md](./requirements.md). Parent design: [architecture refactor](../architecture-refactor/design.md), sections 2.2 to 2.5 and 12 (R2).
> Status: **Step 2: Design (approved 2026-11-27)**.

---

## 1. Approach

1.1. Build one mapping `old path → new path` for all 356 files of `src/` at the start (sections 3 and 4). The generated table is in [mapping.md](./mapping.md): 337 files remain after the later removals (barrels, a merged helper), 298 of them move and 39 stay; no file is left without a target and no two files share one.
1.2. A script applies the mapping with `git mv`, then rewrites every import, export-from, `require` and dynamic `import` in `src/` and `tests/`: it resolves each specifier to an old absolute path, looks the path up in the mapping, and writes the new specifier in the **same style** as the old one (alias `~/` stays alias, relative stays relative). Barrel `index.ts` files move with their folder.
1.3. The compiler is the oracle: `tsc --noEmit` must report 0 errors. Then lint, build, tests, the route inventory and the other checks of section 5.
1.4. The work is cut into ten branches chained in order (section 6). Each branch is one concern, builds and passes alone, and is merged by the owner.
1.5. Documents that name a moved path are rewritten by the same mapping (a second pass of the script over `docs/`, `AGENTS.md` and `README.md`), then read once.

## 2. Alternatives Considered

| Option | Why not |
| :--- | :--- |
| Move files by hand and fix imports in the editor | About 1,070 imports and 356 files; one missed import is found late and the review cannot see it |
| `ts-morph` `sourceFile.move()` | It rewrites relative imports but is uncertain with the `~/` alias and with barrels; adds a tool for a one-time job |
| One large pull request | Cannot be reviewed or reverted in part |
| Seventeen small branches (one per group of the parent design) | Many branches with almost no content each; ten branches keep the same boundaries with less overhead |
| Move modules first, then `core/` | Module branches would rewrite imports of `common/` twice; `core/` first lets the module branches touch module paths only |

## 3. Modules After the Move

Sub-folders follow the rule of the parent design: one folder per entity only in a module that has two or more entities with their own model; one level.

| Module | Layout | Comes from |
| :--- | :--- | :--- |
| `account` | Profile files at the root; sub-folders `group/`, `permission/`, `permission-group/` | `account`, `group`, `permission`, `permission-group` |
| `auth` | Files at the root; sub-folders `session/` and `social-identity/` | `auth`, `session`, `account-provider` |
| `content` | Sub-folders `topic/`, `question/`, `forecast/`, `forecast-topic/`, `forecast-question/`, `vocabulary/`, `voice/` | `topic`, `question`, `forecast`, `forecast-topic`, `forecast-question`, `vocabulary-suggestion`, `voice` |
| `practice` | Sub-folders `attempt/`, `mock-test/`, `jobs/` and `adapters/` | `attempt` without the analysis files, `speaking-session`, `queues/publishers/speaking.producer`, `workers/consumers/speaking.consumer`, `queues/types/speaking.job.types`, `providers/vocabulary-extractor`, `vocabulary-suggestion/vocabulary-extraction.service` (it reads the attempts, so it does not belong to `content`; moved by the correction of 2026-11-27) |
| `assessment` | Flat, with `adapters/` | `attempt-analysis.model`, `attempt-analysis.repository(.interface)`, `speaking-analysis.service`, `speaking-analysis.util`, `speech.mapper` (from `attempt`); `providers/evaluator`, `llm`, `speech-assessment`, `stt` |
| `billing` | Sub-folders `payment/` (with `adapters/`), `package/`, `wallet/` | `payment`, `credit-package`, `credit-log` |
| `file` | Flat with `adapters/` | `file`, `speech` (as `speech.service.ts`), `providers/storage`, `providers/media` |
| `tts` | Flat with `adapters/` | `generated-audio`, `providers/tts` |
| `voice-room` | Flat with `adapters/` | `voice-room`, `infrastructure/livekit` |
| `notification` | Flat with `adapters/`, `jobs/`, `templates/` | `mail`, `providers/mail`, `queues/publishers/mail.producer`, `workers/consumers/mail.consumer`, `resources/mail-templates.ts` |

3.1. The mixed folders keep their internal names (`speaking-session.*`, `credit-log.*`, `generated-audio.*`); renames come with the ticket of each module.
3.2. `attempt.model.ts` re-exports the analysis types of `attempt-analysis.model.ts`; after the move `practice` imports them from `assessment`. This is a known cross-module import (section 7).
3.3. **No folder per layer** (decided by the owner on 2026-11-28). The role of a file is its suffix (`.repository.ts`, `.service.ts`, `.type.ts`), so there is no `repositories/`, `services/` or `types/` folder inside a module; the files sit in the module folder, or in the folder of an entity. A folder exists only for a different concept: an entity of a module with two or more entities, `adapters/` (external systems behind an interface), `jobs/` (background work) or `templates/`. This moved 39 files up by one level, renamed `billing/payment/providers/` to `adapters/` and renamed three files (`queue.constants.ts`, `rate-limiter.type.ts`, `speaking.job.type.ts`). `core/types/` stays because it holds shared types as a concept of its own.
3.4. **Realtime** (decided by the owner on 2026-11-28; payments, scoring and chat messages will all use it). `core/realtime/socket.service.ts` is only the way to send an event, to a user or to a room. The event names belong to the module that sends them (`assessment.constants.ts`, `voice-room.constants.ts` today; billing and chat add theirs), so `core/` does not list the events of every module. The check of the socket ticket is `auth/socket-auth.middleware.ts`, and `main/socket.ts` plugs it into the server, so `core/` imports no module and nothing from `main/`. The socket works on one running copy only; several copies need the Redis adapter of Socket.io and sticky sessions (a deployment task).
3.5. **No barrel files** (decided by the owner on 2026-11-28). An `index.ts` that only re-exports its folder is not used: an import names the file that holds the name (`~/core/persistence/base.repository`). Checked on the repository before the decision: the barrels gave no measurable gain or cost (`tsc` 5.5 s and `vitest` 3.4 s both ways), the dependency check showed the same two cycles, and the move removes two files that imported the barrel of their own folder (a pattern that causes cycles) and the mixed use of both styles in the same folder. The public API of a module will be its `public.ts`, made by each module ticket.

## 4. Shared Code After the Move

### 4.1. `config/` and `main/`

| From | To |
| :--- | :--- |
| `common/config/{env,cors,mongodb,redis}.config.ts` | `config/` (same names; its `index.ts` barrel is removed, section 3.5) |
| `src/main/app.ts` | `main/app.ts` |
| `bootstrap/container.ts` | `main/container.ts` |
| `routes/index.ts` | `main/routes.ts` |
| `infrastructure/socket/socket-boostrap.ts` | `main/socket.ts` (it wires the voice room handlers, so it is a composition file) |
| `infrastructure/workers/worker.setup.ts` | `main/workers.ts` (it resolves the mail and speaking consumers, so it is a composition file) |
| `src/index.ts`, `src/scripts/`, `src/types/*.d.ts` | unchanged |

### 4.2. `core/`

| From | To |
| :--- | :--- |
| `common/base/*` | `core/persistence/` |
| `common/http/*` | `core/http/` |
| `common/middlewares/*` | `core/middlewares/` |
| `common/middlewares/socket.middleware.ts` | `modules/auth/socket-auth.middleware.ts` (it checks the socket ticket that `auth` issues; `main/socket.ts` plugs it into the server) |
| `infrastructure/rate-limiter/*` | `core/rate-limiter/` |
| `common/errors/*`, `common/constants/error-codes.ts` | `core/errors/` (`error.constants.ts` holds `ERROR_CODES`) |
| `common/types/*` | `core/types/` |
| `common/utils/*` | `core/utils/` |
| `common/contracts/*` (renamed `.interface.ts`), `common/types/token-payload.type.ts`, `infrastructure/security/*` | `core/security/` (the token interface, JWT service, payload, hasher and token duration stay together: one concern, one folder; the three unused `index.ts` barrels are removed) |
| `common/constants/di.tokens.ts` | `core/di/di.constants.ts` |
| `common/constants/status.constants.ts` | `core/persistence/status.constants.ts` |
| `infrastructure/cache/*` | `core/cache/` |
| `infrastructure/redis/*` | `core/redis/` |
| `infrastructure/logging/*` | `core/logging/` |
| `infrastructure/health/health.router.ts`, `infrastructure/shutdown.ts` | `core/lifecycle/` |
| `infrastructure/queues/{index,queue.constant,queue.factory}.ts`, `publishers/base.producer.ts` | `core/queue/` |
| `infrastructure/workers/worker.factory.ts`, `workers/consumers/base.consumer.ts` | `core/queue/` (the two factories are `queue.registry.ts` and `worker.registry.ts`, see the mapping; flat: the queue folder has no sub-folder; the unused `workers/index.ts` barrel is removed) |
| `infrastructure/bull-board.config.ts` | `main/bull-board.ts` (only `index.ts` calls it, and it wires the dashboard into Express) |
| `infrastructure/socket/socket.service.ts` | `core/realtime/` |
| `infrastructure/socket/socket.constants.ts` | `modules/assessment/assessment.constants.ts` (only `assessment` uses the event names) |

## 5. Verification (for every branch)

| Check | How | Proves |
| :--- | :--- | :--- |
| Types | `pnpm exec tsc --noEmit --noUnusedLocals --noUnusedParameters` | no import is broken |
| Build, lint, tests | `pnpm build`, `pnpm lint`, `pnpm test:coverage` | the app still builds and the 28 tests (the 26 of before and the route inventory) pass; coverage must not fall |
| Route inventory | New test `tests/api/route-inventory.test.ts` snapshots the method and path of every route of `createApp()`; written **before** the first move and checked in every branch | no route is lost or added |
| Static route index | The script that produced the [endpoint index](../../08-integration-contracts/03-endpoint-index.md) is run again | the auth, permission and rate limit of every route are unchanged |
| Only moves | A script strips import and export-from specifiers from each moved file and compares it with the original (found through `git diff -M --name-status`) | no line other than imports changed |
| File count | The script compares the set of files before and after (every old file maps to one new file; no file appears or disappears) | nothing is lost |
| Duplication | SonarQube Cloud (the `pnpm dup` gate was dropped on 2026-11-28) | the threshold still holds |
| Old paths in documents | `grep` for the old folder names | AC9 |
| Docker | `Dockerfile` and `package.json` scripts are not changed; the image is built by CI | AC7 |

5.1. Mongoose model names, collection names, queue names, DI tokens, environment variables and route paths are not touched, so no data and no client is affected.
5.2. Because `dist/` is rebuilt by `pnpm build` (`rimraf dist` first), stale files are not a risk.

## 6. Branches

| # | Branch | Content |
| :--- | :--- | :--- |
| 0 | `test/route-inventory` | The route inventory test and the mapping script; no move |
| 1 | `refactor/layout-main-config` | `config/`, `main/` (app, container, routes, socket, workers) |
| 2 | `refactor/layout-core-base` | persistence, http, middlewares, errors, types, utils, security, di, constants |
| 3 | `refactor/layout-core-runtime` | cache, redis, logging, lifecycle, queue, realtime |
| 4 | `refactor/layout-account-auth` | `account`, `auth` |
| 5 | `refactor/layout-content` | `content` (including `voice/`) |
| 6 | `refactor/layout-billing` | `billing` |
| 7 | `refactor/layout-practice-assessment` | `practice`, `assessment` |
| 8 | `refactor/layout-file-tts` | `file`, `tts` |
| 9 | `refactor/layout-voice-room-notification` | `voice-room`, `notification` |
| 10 | `refactor/layout-dependency-check` | `dependency-cruiser` in warning mode, the baseline, the final documents |

6.0. Delivery (2026-11-28): the owner chose one branch, `refactor/module-layout`, and one pull request, in three commits (the spec and the mapping, the route test, the move with the boundary check). The steps of the table above were checkpoints on local branches, squashed into those commits; they are kept here as the order of the work.
6.1. The check table of section 5 is pasted in the pull request.
6.2. Each branch updates the documents that name its paths: `layout-and-index.md`, `01-system-overview.md` (directory structure), `layers-and-modules.md`, `AGENTS.md`, `README.md` (project structure), `endpoint-index`, `data-dictionary` and the specs that cite paths.

## 7. Known Violations and Baseline

Imports from `core/` into a module and files that mix several modules, as they will be after the move. Each is removed by the ticket named in the last column.

| Where | What | Removed by |
| :--- | :--- | :--- |
| `core/queue/queue.constants.ts` | Queue names and job names of mail, speaking and voice in one file | `practice-assessment` and `notification` |
| `core/di/di.constants.ts` | One list of the tokens of every module | each module ticket moves its token |
| `core/persistence/status.constants.ts` | One status enum shared by several modules | each module ticket defines its own |
| `main/socket.ts`, `main/workers.ts`, `main/container.ts`, `main/routes.ts` | Composition files that import modules | allowed: `main/` is the composition root |
| `practice` imports from `assessment` | `attempt.model.ts` re-exports the analysis types | `practice-assessment` |
| `assessment/adapters/*` import from `practice` | The evaluator reads `attempt.model` types | `practice-assessment` |

7.1. **Baseline of the dependency check on 2026-11-28** (`pnpm deps`, after the last move, 397 files and 1,143 dependencies cruised, 0 errors, 62 warnings; it was 63 on 2026-11-27, before the socket ticket check left `core/`):

| Rule | Count |
| :--- | :--- |
| `cross-module-import` (a module imports another module's files; `public.ts` does not exist yet) | 60 imports in 25 module-to-module links |
| `no-circular` (file cycles) | 2: `content/voice/voice.service` with `tts/generated-audio.service`, and `practice/attempt/attempt.service` with `practice/mock-test/speaking-session.service` |
| `core-config-not-to-modules` | 0 (the socket ticket check is `auth/socket-auth.middleware.ts` since 2026-11-28) |
| `modules-not-to-main` | 0 |

7.2. **Module pairs that import each other (7):** account and billing (2 and 1 imports), assessment and content (1 and 1), assessment and practice (6 and 5), billing and practice (1 and 6), content and practice (4 and 9), content and tts (3 and 1), file and tts (1 and 2). The parent design expected five pairs; the new module assignment (the voice catalog in `content`, the vocabulary extractor in `practice`) changes which pairs appear. The most connected module is `practice` (it imports `content` 9 times, `billing` 6 times, `assessment` 5 times).
7.3. These numbers are the starting point for `module-public-api` and the module tickets; the goal is zero cross-module imports outside `public.ts`, zero cycles and zero imports from `core/` or `config/` into a module.

## 8. Risks

| Risk | Mitigation |
| :--- | :--- |
| A string that names a path (a dynamic `import`, a `vi.mock`, a config file) is not found by the script | The compiler and the tests catch most; the two `require` and dynamic import sites are listed and fixed by hand; `grep` for the old folder names in strings |
| Another local branch (`feature/friend`, `chat`, `call`, `voice-room-*`) conflicts with the moves | Those branches are rebased on the new layout when they are resumed; a note is added to each in the handoff |
| A case-only rename or a path with `\` on the NTFS volume | No case-only rename is planned; paths are checked on the Linux filesystem view |
| A very large diff hides a real change | The "only moves" script and `git diff -M` show that each file differs only in imports |
| `tsyringe` metadata or Mongoose model registration depends on import order | The tests build the whole container and the app; the route inventory fails if a module is not registered |

## 9. Documents Affected

`docs/layout-and-index.md`, `docs/01-introduction/01-system-overview.md`, `docs/07-development-guides/02-layers-and-modules.md`, `docs/03-architecture/*` (paths), `docs/08-integration-contracts/03-endpoint-index.md` (source paths), `docs/specs/architecture-refactor/design.md` (the `account/access/` folder becomes three sub-folders because the rule allows one level), `AGENTS.md`, `README.md`.
