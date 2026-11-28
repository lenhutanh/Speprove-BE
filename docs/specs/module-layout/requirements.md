# Module Layout: Requirements (Backend)

> Repository: `speprove-be`. Branch: `refactor/module-layout` (three commits, based on `main`).
> Part of: step R2 of the [architecture refactor design](../architecture-refactor/design.md); board row 11 of [the backlog](../../plan/backlog.md).
> Status: **Step 1: Requirements (approved 2026-11-27)**.

---

## 1. Goal

Move the code into the target folders of the refactor (`config/`, `main/`, `core/` and ten modules) **without changing behavior**, so that every later refactor step (account and auth, billing, practice and assessment, content, tts and file, voice room) works on the final structure and every module has a clear boundary.

## 2. Context

### 2.1. Current State

2.1.1. `src/` has `common/` (38 files), `infrastructure/` (60 files), 24 flat folders in `modules/` (250 files), and loose `app.ts`, `index.ts`, `bootstrap/`, `routes/`, `resources/`, `types/`, `scripts/`.
2.1.2. `common/` and `infrastructure/` mix technical code with business code: the speaking job types and producers, the mail templates, the LiveKit service and the providers of Groq, Azure, Cloudinary and Brevo all sit in shared folders.
2.1.3. Imports use the alias `~/` (524 imports) and relative paths (544 imports); two files use `require` or dynamic `import`. Tests import `src` through the alias (29 imports).
2.1.4. The tests (26) and the build pass; no tool checks module boundaries. A test that lists the routes is added as the first task of this ticket.

### 2.2. Decisions

2.2.1. **Move only.** Files move and imports are rewritten. No class, function, route, model or collection is renamed or changed; renames of classes and files follow in the tickets of each module.
2.2.2. **Ten modules:** `account`, `auth`, `content`, `practice`, `assessment`, `billing`, `file`, `tts`, `voice-room`, `notification` (see [the design](./design.md), section 3, for the contents). The voice catalog lives in `content`; `tts` is the capability only; `assessment` is its own module from the start.
2.2.3. **Sub-folders** only in modules that hold two or more entities with their own model, route and service, one level deep, no folders grouped by layer.
2.2.4. `src/index.ts` stays the single entry point, so `package.json` scripts, `nodemon.json`, the Dockerfile and `dist/index.js` do not change. `src/scripts/seed.ts` stays where it is.
2.2.5. Business code that sits in shared folders moves into its module, but the generic part stays in `core/`. Where one file mixes both (for example `queue.constant.ts` holds queue and job names of several modules), the file moves whole to `core/` and the mix is listed as a known violation that the ticket of the owning module removes.
2.2.6. The work is split into ten branches chained one after the other, one concern each, so that a problem can be reverted without losing the rest. The owner merges each one when it is green.
2.2.7. Moves are done by a script and checked by the compiler, never by hand.
2.2.8. Documents that name a moved path are updated in the same branch ([guidelines](../../docs-update-guidelines.md), section 3.2).

## 3. User Stories

3.1. As a **developer**, I want each module in one folder with its adapters, jobs and templates, so that I find what a module owns without searching three trees.
3.2. As a **developer**, I want technical code and business code separated, so that a module can later become a service without untangling shared folders.
3.3. As the **owner**, I want proof that nothing changed for the user, so that I can merge each step without a manual test of the whole product.

## 4. Acceptance Criteria

- **AC1.** **Behavior unchanged.** `pnpm test` passes (26 tests plus the route inventory test of AC2) after every branch; `pnpm build` passes; `tsc --noEmit --noUnusedLocals --noUnusedParameters` reports 0 errors; `pnpm lint` reports 0 errors and no more than 211 warnings; duplication stays under the 5 percent threshold (measured by SonarQube Cloud; the `pnpm dup` gate was dropped on 2026-11-28).
- **AC2.** **Same routes.** A test lists the method and path of every route registered by `createApp()`; the list (95 routes today) is identical before and after every branch. The static route index (auth, permission, rate limit per route, see the [endpoint index](../../08-integration-contracts/03-endpoint-index.md)) is regenerated after the last branch and is identical.
- **AC3.** **Only moves.** For every moved file, its content outside import and export specifiers is identical to the original (checked by a script; the output is kept in the pull request). `git log --follow` follows each file across its move.
- **AC4.** **Target tree.** After the last branch `src/` contains `config/`, `main/`, `core/`, `modules/`, `scripts/`, `types/` and `index.ts`; the folders `common/`, `infrastructure/`, `bootstrap/`, `routes/`, `resources/` and the file `src/main/app.ts` no longer exist.
- **AC5.** **Ten modules.** `src/modules/` contains exactly the ten modules listed in 2.2.2, and each source file of the old 24 folders is in one of them (a script compares the file lists before and after).
- **AC6.** **No business name in `core/` and `config/`.** No folder or file there is named after a business concept (speaking, mail, livekit, groq, azure, payos, cloudinary, evaluator). The mixed files of 2.2.5 are listed in [the design](./design.md), section 7, each with the ticket that removes it.
- **AC7.** **Unchanged runtime surface.** `dist/index.js` is still the entry point; the Docker image command, `package.json` scripts, `nodemon.json` and `pnpm db:seed` work as before; no environment variable is added or removed.
- **AC8.** **Boundary check in warning mode.** A dependency check (`dependency-cruiser`) runs with `pnpm deps`, reports cycles and imports into another module's internals, and does **not** fail the build yet; the baseline numbers are recorded in [the design](./design.md), section 7. They are expected to fall in the next tickets.
- **AC9.** **Documents match.** `grep` for the old paths (`src/common/`, `src/infrastructure/`, `src/bootstrap/`, `src/routes/`, and the old module folder names in `src/modules/<old>/`) in `docs/`, `AGENTS.md` and `README.md` finds none, except in historical findings that cite the old location and say so.
- **AC10.** **Reversible.** Each branch builds and passes alone on top of the previous one; reverting the last merged branch leaves a green tree.

## 5. Non-Functional Criteria

- Compile and test time of the project does not grow by more than 10 percent.
- No new runtime dependency (the dependency check is a development dependency).

## 6. Out of Scope

- Splitting `AttemptService` or `SpeakingAnalysisService`, gathering the credit code, changing permissions, removing cycles: these are the next tickets.
- Renaming classes, files, routes or collections.
- The `ROLE=api|worker` split of the process.
- Splitting `di.constants.ts` and `status.constants.ts` per module (logic change, done in the module tickets).
