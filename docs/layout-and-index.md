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
│   └── 01-system-overview.md            # layers, DI, directory structure, conventions, scripts
├── 04-business-logic/
│   ├── 01-ai-scoring.md                 # transcribe, assess, evaluate; mock sessions; retries; refunds
│   └── 02-payment-and-credit.md         # PayOS, webhook safeguards, credit deduction and refunds
├── specs/                               # one folder per feature: requirements, design, tasks
│   ├── app-foundation/                  # runtime foundation: logger, probes, shutdown, config, tests, CI
│   ├── architecture-refactor/           # ten modules, core layout, conventions, work breakdown (draft)
│   └── scoring-pipeline-v2/             # hybrid feature-based scoring design (draft, partly superseded)
├── plan/
│   ├── backlog.md                       # epics and checklists until the thesis defense
│   ├── baseline-2026-11-22.md           # measured code-quality, structure and test numbers
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
| The target module layout and refactor steps | [`specs/architecture-refactor/design.md`](./specs/architecture-refactor/design.md) |
| The planned scoring pipeline | [`specs/scoring-pipeline-v2/design.md`](./specs/scoring-pipeline-v2/design.md) |
| What is planned until the defense | [`plan/backlog.md`](./plan/backlog.md) |
| Numbers measured before the refactor | [`plan/baseline-2026-11-22.md`](./plan/baseline-2026-11-22.md) |
| How to write or change a document | [`docs-update-guidelines.md`](./docs-update-guidelines.md) |

## 4. API

Swagger UI is served at `/v1/api-docs` outside production, but no endpoint is documented there yet. Until then, read the routes in `src/routes/index.ts` and each module's `*.route.ts` and `*.validation.ts`.

## 5. Related Material Outside the Repository

Module boundary rules and the microservice roadmap are in `architecture_roadmap.md` in the workspace folder.
