# Documentation Layout and Index

## 1. Overview

This document is the index of the backend documentation. Rules for writing and updating documents are in [docs-update-guidelines.md](./docs-update-guidelines.md). To run the project, see the [README](../README.md). Instructions for AI assistants are in [`AGENTS.md`](../AGENTS.md).

A document is listed here only when it exists. Folders are numbered by domain and created when their first document is written.

## 2. Layout

```text
docs/
├── layout-and-index.md                  # this index
├── docs-update-guidelines.md            # rules for writing and updating documents
├── 01-introduction/
│   ├── 01-system-overview.md            # layers, DI, directory structure, scripts
│   ├── 02-requirements.md               # scope, actors, business rules, user stories with acceptance criteria
│   └── 03-non-functional-requirements.md # quality targets with numbers, implemented limits, how each is measured
├── 02-getting-started/
│   └── 01-setup-local-env.md            # requirements, install, checks, tests, Docker, seed warning, common problems
├── 03-architecture/
│   ├── 01-security-and-rbac.md          # groups, permissions, route protection, security controls, known gaps
│   ├── 02-authentication.md             # tokens, cookies, registration, sessions, refresh rotation, socket tickets
│   ├── 03-data-persistence.md           # MongoDB and Redis, repositories, transactions, indexes, Redis keys
│   ├── 04-validation.md                 # Zod schemas, helpers, error shape, rules
│   ├── 05-queues-and-realtime.md        # BullMQ queues and jobs, defaults, Socket.io events, shutdown, limits
│   ├── 06-data-dictionary.md            # every collection: fields, relations, indexes, ER diagram
│   └── 07-system-diagrams.md            # context, components, request layers, deployment
├── 04-business-logic/
│   ├── 01-ai-scoring.md                 # transcribe, assess, evaluate; mock sessions; retries; refunds
│   ├── 02-payment-and-credit.md         # PayOS, webhook safeguards, credit deduction and refunds
│   └── 03-feature-design-guide.md       # lifecycle of a feature: spec, approval, build order, verification
├── 06-testing/
│   ├── 01-testing-strategy.md           # layers, harness, test-first rule, what must be tested, traceability
│   └── 02-test-plan.md                  # levels, entry and exit criteria, story-to-test traceability, defects
├── 07-development-guides/
│   ├── 01-coding-standards.md           # formatting, TypeScript, naming, errors, logging, data access
│   └── 02-layers-and-modules.md         # request flow, layer duties, module rules, authorization, new module
├── 08-integration-contracts/
│   ├── 01-api-conventions.md            # request, response envelope, status codes, pagination, rate limit
│   ├── 02-error-codes.md                # error code registry and known deviations
│   └── 03-endpoint-index.md             # every route: auth, permission, rate limit, gaps
├── 09-operations/
│   ├── 01-configuration-reference.md    # every environment variable, defaults, per-environment rules
│   └── 02-ci-cd-and-quality-gates.md    # pipeline today, planned gates, delivery, pull request rules
├── specs/                               # one folder per feature: requirements, design, tasks
│   ├── app-foundation/                  # runtime foundation: logger, probes, shutdown, config, tests, CI
│   ├── architecture-refactor/           # ten modules, core layout, conventions, work breakdown (draft)
│   ├── scoring-pipeline-v2/             # hybrid feature-based scoring design (draft, partly superseded)
│   ├── measure-baseline/                # task list of the baseline measurement (tasks only, with results)
│   └── ci-quality-gates/                # task list of the CI quality gates (tasks only, with results)
├── plan/
│   ├── backlog.md                       # epics and checklists until the thesis defense
│   ├── baseline-2026-11-22.md           # measured code-quality, structure and test numbers
│   ├── technical-debt.md                # known weaknesses, impact, status and the ticket that removes each
│   └── handoff.md                       # dated snapshot of the work in progress
└── assets/
    └── SYSTEM_ARCHITECTURE.png          # system integration diagram used by the README
```

## 3. Quick Find

| If you are looking for... | Read |
| :--- | :--- |
| How the code is layered and where things live | [`01-introduction/01-system-overview.md`](./01-introduction/01-system-overview.md) |
| How an answer is scored, retried and refunded | [`04-business-logic/01-ai-scoring.md`](./04-business-logic/01-ai-scoring.md) |
| How credits are bought, deducted and refunded | [`04-business-logic/02-payment-and-credit.md`](./04-business-logic/02-payment-and-credit.md) |
| How to design and run a feature or a spec | [`04-business-logic/03-feature-design-guide.md`](./04-business-logic/03-feature-design-guide.md) |
| Code style, naming, errors, logging, data access | [`07-development-guides/01-coding-standards.md`](./07-development-guides/01-coding-standards.md) |
| Layers, module boundaries, DI, permissions, adding a module | [`07-development-guides/02-layers-and-modules.md`](./07-development-guides/02-layers-and-modules.md) |
| The shape of requests, responses, status codes | [`08-integration-contracts/01-api-conventions.md`](./08-integration-contracts/01-api-conventions.md) |
| What an `errorCode` means, and known deviations | [`08-integration-contracts/02-error-codes.md`](./08-integration-contracts/02-error-codes.md) |
| How to run the project locally | [`02-getting-started/01-setup-local-env.md`](./02-getting-started/01-setup-local-env.md) |
| What an environment variable does | [`09-operations/01-configuration-reference.md`](./09-operations/01-configuration-reference.md) |
| Who may do what, and how routes are protected | [`03-architecture/01-security-and-rbac.md`](./03-architecture/01-security-and-rbac.md) |
| Sign-in, tokens, sessions, refresh | [`03-architecture/02-authentication.md`](./03-architecture/02-authentication.md) |
| How data is stored, transactions, indexes, Redis keys | [`03-architecture/03-data-persistence.md`](./03-architecture/03-data-persistence.md) |
| How input is validated | [`03-architecture/04-validation.md`](./03-architecture/04-validation.md) |
| Background jobs and socket events | [`03-architecture/05-queues-and-realtime.md`](./03-architecture/05-queues-and-realtime.md) |
| A collection, its fields and relations | [`03-architecture/06-data-dictionary.md`](./03-architecture/06-data-dictionary.md) |
| What the product must do, and how each rule is checked | [`01-introduction/02-requirements.md`](./01-introduction/02-requirements.md) |
| Quality targets with numbers | [`01-introduction/03-non-functional-requirements.md`](./01-introduction/03-non-functional-requirements.md) |
| Diagrams: context, components, deployment | [`03-architecture/07-system-diagrams.md`](./03-architecture/07-system-diagrams.md) |
| Which route needs which permission | [`08-integration-contracts/03-endpoint-index.md`](./08-integration-contracts/03-endpoint-index.md) |
| What is tested and what is missing | [`06-testing/02-test-plan.md`](./06-testing/02-test-plan.md) |
| What runs in CI and what is planned | [`09-operations/02-ci-cd-and-quality-gates.md`](./09-operations/02-ci-cd-and-quality-gates.md) |
| Known weaknesses and their plan | [`plan/technical-debt.md`](./plan/technical-debt.md) |
| How to test, and what must be tested | [`06-testing/01-testing-strategy.md`](./06-testing/01-testing-strategy.md) |
| The target module layout and refactor steps | [`specs/architecture-refactor/design.md`](./specs/architecture-refactor/design.md) |
| The planned scoring pipeline | [`specs/scoring-pipeline-v2/design.md`](./specs/scoring-pipeline-v2/design.md) |
| What is planned until the defense | [`plan/backlog.md`](./plan/backlog.md) |
| Numbers measured before the refactor | [`plan/baseline-2026-11-22.md`](./plan/baseline-2026-11-22.md) |
| How to write or change a document | [`docs-update-guidelines.md`](./docs-update-guidelines.md) |

## 4. API

The conventions are in [`08-integration-contracts/`](./08-integration-contracts/). There is no endpoint reference yet: read the routes in `src/routes/index.ts` and each module's `*.route.ts` and `*.validation.ts`.

## 5. Related Material Outside the Repository

Module boundary rules and the microservice roadmap are in `architecture_roadmap.md` in the workspace folder.
