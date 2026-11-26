# Measure Baseline: Tasks (Backend)

> Repository: `speprove-be`. Branch: `chore/measure-baseline` (local only), based on `docs/reference-docs`.
> Kind: task list (no requirements or design file). Board row 8 of [the backlog](../../plan/backlog.md).
> Status: **Done on 2026-11-26** (approved in chat the same day). Measured at commit `7cd06b2`, Linux x86_64, Node 24.21, pnpm 10.26.2.
> Evidence column: **test** means an automated test covers it; **code** means it was checked by running a command and reading its output; **none** means no evidence.

---

## 1. Goal

Record the numbers of the code before any structural refactor, so that every later step can be compared with them. No code change.

## 2. Scope

- Files changed: [`docs/plan/baseline-2026-11-22.md`](../../plan/baseline-2026-11-22.md) (new section "Re-measured on 2026-11-26"), the "Measured" cells of NFR-09 and NFR-22 in [the NFR document](../../01-introduction/03-non-functional-requirements.md), this file.
- Not changed: source code, `package.json`, the lockfile.
- Out of scope: line coverage (needs `@vitest/coverage-v8`, added in the CI quality gates ticket) and a static analysis service (needs the decision whether the repository is public).

## 3. Tasks

| Done | # | Task | Command | AC | Result | Evidence |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| [x] | 1 | Measure lint | `pnpm exec eslint . -f json`, grouped by rule | AC1: errors, warnings and the top rules are recorded | 0 errors, 211 warnings; 196 `no-explicit-any`, 10 `prettier/prettier`, 5 `no-unused-vars` | code |
| [x] | 2 | Count `any` and lint suppressions | `grep -rE` over `src` | AC2: two numbers recorded | 169 `any`, 15 `eslint-disable` or `@ts-ignore` | code |
| [x] | 3 | Measure complexity and function length | `eslint --rule complexity=12, max-lines-per-function=70, max-params=5 src` | AC3: number of functions over each threshold | 23, 16, 8 | code |
| [x] | 4 | Measure duplication | `npx jscpd@4 src --min-lines 8` (tool fetched into the npx cache, not into the project) | AC4: percentage, number of clones, largest clones | 1.11 percent (186 of 16,711 lines), 15 clones; largest inside `voice-room.service.ts` | code |
| [x] | 5 | Measure tests | `pnpm test` | AC5: passed over total, duration | 8 files, 26 of 26 pass, 14 s | test |
| [x] | 6 | Measure size | `wc -l` over `src/**/*.ts` | AC6: total lines, number of files and modules, largest files | 16,934 lines, 356 files, 24 modules; largest `voice-room.service.ts` 693 | code |
| [x] | 7 | Measure vulnerable dependencies | `pnpm audit` | AC7: count by severity | 1 moderate (`minimatch` through `nodemon`) | code |
| [x] | 8 | Record the numbers | edit the three documents above | AC8: each number has a command, a date, a commit and the environment | See the section "Re-measured on 2026-11-26" of the baseline | code |
| [x] | 9 | Final gates | `pnpm lint`, `pnpm build`, `pnpm test`, `git diff --name-only` | AC9: the three commands still pass; only `.md` files changed | lint 0 errors, build passes, 26 of 26 tests pass, no non-`.md` file in the diff | test and code |

## 4. Manual Check

- [ ] Rerun one command of the table (for example `npx jscpd@4 src --min-lines 8`) and compare with the baseline. Expected: the same number on the same commit.

## 5. Not Measured Here

- Line coverage and the static analysis figures (Blocker and Critical issues): they need the tools of the CI quality gates ticket.
- Why the number of functions longer than 70 lines rose from 12 to 16: not investigated.
