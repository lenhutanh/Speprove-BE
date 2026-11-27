# CI Quality Gates: Tasks (Backend)

> Repository: `speprove-be`. Branch: `ci/quality-gates` (local only), based on `chore/measure-baseline`.
> Kind: task list (no requirements or design file). Board row 9 of [the backlog](../../plan/backlog.md); gate details in [CI/CD and quality gates](../../09-operations/02-ci-cd-and-quality-gates.md).
> Status: **Backend part done on 2026-11-26** (approved in chat). Open: the frontend workflow, a static analysis service, branch protection.
> Evidence column: **test** means an automated test covers it; **code** means it was checked by running a command; **none** means no evidence. **not run** means written but not run in this environment.

---

## 1. Goal

Make every pull request show how much of the code the tests cover, stop the duplication from growing, keep dependencies and the base image under watch, and build the image in CI.

## 2. Scope

- Changed: `package.json` and `pnpm-lock.yaml` (development dependencies: `@vitest/coverage-v8`; `jscpd` was added here and dropped on 2026-11-28), `vitest.config.mts`, `.github/workflows/ci.yml`, `.github/dependabot.yml`, and the documents listed in task 8.
- Not changed: source code, tests.
- Out of scope here: the frontend workflow (the frontend repository has uncommitted work and a different branch line), SonarCloud (needs the answer whether the repository is public), branch protection (a repository setting of the owner).

## 3. Tasks

| Done | # | Task | AC | Result | Evidence |
| :--- | :--- | :--- | :--- | :--- | :--- |
| [x] | 1 | Add `@vitest/coverage-v8@5.1.1` (the version of `vitest`), the script `test:coverage` and the coverage block in `vitest.config.mts` | AC1: `pnpm test:coverage` passes and writes `coverage/` (ignored by Git) | 26 of 26 tests pass; lines 22.03 percent, statements 20.79, branches 8.92, functions 15.5 | test |
| [x] | 2 | Report coverage per module | AC2: the numbers for the core modules are recorded | Core modules about 20.4 percent: payment 51.2, credit-log 51.4, session 43.8, account 38.7, group 32.6, permission 24.4, auth 23.4, speaking-session 11.8, attempt 8.6 | code |
| [x] | 3 | CI: run `pnpm test:coverage`, write a coverage summary to the job summary, upload `lcov.info` and `coverage-summary.json` | AC3: the workflow parses and the steps are in the right order | YAML parses; the steps are in `ci.yml` | code; not run on GitHub |
| [x] | 4 | CI: duplication gate `pnpm dup` (`jscpd` pinned as a development dependency, script `dup` in `package.json`) | AC4: passes at the current level and fails when the threshold is lowered | Exit 0 at threshold 5 (1.11 percent); exit 1 at threshold 1 | code |
| [x] | 5 | Add `.github/dependabot.yml` (npm grouped by minor and patch, GitHub Actions, Docker; weekly) | AC5: the file parses and lists the three ecosystems | Parses; three ecosystems | code; not run on GitHub |
| [x] | 6 | CI: job `image` that builds the Docker image (the Trivy scan was dropped on 2026-11-28, see the correction below) | AC6: the job is defined after `check` and fails the run only when the build fails | Defined; **the image was not built locally**: a first attempt filled the 42 GB root disk, so the local build is left to CI | not run |
| [x] | 7 | Final gates | AC7: `pnpm lint`, `pnpm build`, `pnpm test:coverage` pass | lint 0 errors (211 warnings), build passes, 26 of 26 tests pass | test and code |
| [x] | 8 | Update documents | AC8: the CI document, the baseline, NFR-24, the test plan, the testing strategy, the overview scripts, the debt register and the index state the new facts | Updated in this branch | code |

## 4. Manual Checks (owner)

- [ ] Push the branch, open the pull request and read the first CI run: the `check` job and the `image` job should both finish; read the coverage summary of the job.
- [ ] In the repository settings: enable Dependabot alerts and security updates; protect `main` (a pull request and a green CI are required).

## 5. Open (next steps of this ticket)

- Frontend CI workflow (lint, type check, build) in `speprove-fe`.
- Static analysis service: decided on 2026-11-28 to run SonarQube Cloud from the workflow (the same branch, `ci/quality-gates`); it needs the secret `SONAR_TOKEN` and two repository variables. The `pnpm dup` gate and `jscpd` were removed because Sonar measures duplication.
- Commit lint for Conventional Commits.
- Raise the coverage threshold from "report only" to a failing gate once the core modules reach 50 percent.

## 6. Corrections (2026-11-28)

- The duplication gate (`pnpm dup`, `jscpd`) was dropped: SonarQube Cloud measures duplication, and the analysis now runs from the workflow (the same branch, `ci/quality-gates`).
- The Trivy step was dropped: `aquasecurity/trivy-action@0.28.0` no longer resolves (the tags of that action were rewritten in the March 2026 supply chain incident, and the advisory says the original tags were deleted), so the `image` job would have failed. The job keeps the Docker build. An image scan is a question for the registry of the cloud host, in the `ci-cd-staging` ticket.
