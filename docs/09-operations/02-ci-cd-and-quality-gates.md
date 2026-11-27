# CI/CD and Quality Gates

What runs automatically on every change, what is planned, and what decides that a change may merge or be deployed. The workflow file is `.github/workflows/ci.yml`. The way a change is written and tested is in [coding standards](../07-development-guides/01-coding-standards.md) and [the testing strategy](../06-testing/01-testing-strategy.md).

## 1. Pipeline Today

The workflow `CI` runs on every pull request and on every push to `main`. One job (`check`, 20 minutes at most) runs these steps in order; a failing step fails the job.

| Step | Command or action | Purpose |
| :--- | :--- | :--- |
| 1 | `actions/checkout` with full history | Source and history (the secret scan reads history) |
| 2 | `pnpm/action-setup`, `actions/setup-node` with `.nvmrc`, `pnpm install --frozen-lockfile` | Reproducible install |
| 3 | `pnpm lint` | ESLint and Prettier rules |
| 4 | `pnpm build` | TypeScript compile |
| 5 | cache of the MongoDB binary, `pnpm test` | Unit and API tests |
| 6 | `pnpm audit --audit-level=high` | Fails on a high or critical advisory |
| 7 | `gitleaks/gitleaks-action` | Secret scan over the history |

1.1. Concurrent runs of the same branch cancel the older one. The workflow has read-only repository permission.
1.2. **Status:** the workflow is written and has not run on GitHub yet; the first run may need fixes. The frontend has no workflow.

## 2. Planned Quality Gates

| Gate | What it adds | Decision needed | Checks |
| :--- | :--- | :--- | :--- |
| Coverage | `@vitest/coverage-v8`, script `test:coverage`, report uploaded by CI | none | NFR-24 |
| Static analysis | SonarCloud (free for public repositories) or, for a private repository, `jscpd` for duplication plus ESLint for issues | Is the repository public? | NFR-22, NFR-23 |
| Dependency updates | `.github/dependabot.yml` for npm and GitHub Actions; alerts enabled in the repository | none | NFR-09 |
| Image scan | A container scan of the built image (Trivy) before it is pushed | none | NFR-09 |
| Frontend CI | A workflow for `speprove-fe`: install, lint, type check, build, tests | none | NFR-20 |
| Branch protection | `main` requires a pull request and a green CI; direct pushes refused | Repository owner action | process |
| Commit lint | Conventional Commits checked on pull requests | none | process |

2.1. A gate is added only with a first run that is green; a gate that is red from day one is ignored.
2.2. Thresholds that fail a pull request: the CI steps above, no new `critical` or `blocker` static-analysis issue, and coverage of the core modules not below the agreed target ([test plan](../06-testing/02-test-plan.md), section 6).

## 3. Delivery (Planned)

```mermaid
flowchart LR
    PR["Pull request"] --> CI["CI: lint, build, test, audit, secrets, scan"]
    CI -->|"green, merge"| MAIN["main"]
    MAIN --> BUILD["Build and tag the image with the commit SHA"]
    BUILD --> PUSH["Push to the registry"]
    PUSH --> DEPLOY["Deploy to staging"]
    DEPLOY --> HEALTH["Health check on /health and /ready"]
    HEALTH -->|"fails"| ROLL["Roll back to the previous SHA"]
```

3.1. **Versioning:** an image is tagged with the commit SHA; a release is a SHA.
3.2. **Rollback:** redeploy the previous SHA. The script and the steps are written when the host is chosen.
3.3. **Secrets:** stored in the platform's secret store (GitHub Environments for CI and deploy); never in the repository ([configuration](./01-configuration-reference.md), section 8).
3.4. **Monitoring after deploy:** the health check above, an uptime check on `/health` with an alert, and logs collected in one place. The log format is JSON with a request id on each line.
3.5. **Record:** every deploy is recorded (SHA, time, result) so the deployment history can be shown.
3.6. The host, the registry, the trigger and the monitoring tool are decided in the `ci-cd-staging` ticket and written here when they exist.

## 4. Rules for a Pull Request

4.1. One concern per pull request; the description lists the acceptance criteria and the evidence ([feature design guide](../04-business-logic/03-feature-design-guide.md), section 4.3).
4.2. The pull request is green before merge. A flaky test is fixed or isolated, not rerun until it passes.
4.3. A change that makes a document wrong updates the document in the same pull request ([guidelines](../docs-update-guidelines.md), section 3.2).
4.4. A merge uses a merge commit when branches are chained, so the commits of the later branches stay identical.
