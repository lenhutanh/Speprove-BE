# Documentation Update Guidelines

Rules for writing and updating the documentation of Speprove. They apply to human contributors and to AI assistants.

## 1. Core Principles

### 1.1. Keep Existing Detail

1.1.1. Never summarize, truncate or remove existing technical detail unless it is obsolete or replaced by an approved change.
1.1.2. Class names, function names, endpoints, status codes, error codes and environment variable names keep their exact spelling.

### 1.2. No Secrets and No Local Paths

1.2.1. Never write real passwords, keys, tokens or the content of a `.env` file in a document.
1.2.2. Never write an absolute path of a developer machine (`D:\...`, `file:///...`, `/home/...`). Use paths relative to the repository root, or relative links between documents.
1.2.3. Refer to configuration by variable name (for example `PAYOS_API_KEY`), never by value.

### 1.3. Numbered Structure

1.3.1. Use the hierarchy `# Title`, `## 1. Section`, `### 1.1. Sub-section`, `#### 1.1.1. Clause`.
1.3.2. Do not use informal headings ("Step A", "Part 1") for the main structure.

### 1.4. One Place per Fact

1.4.1. Every fact lives in one document. Other documents link to it instead of restating it.
1.4.2. Do not write package versions in prose. Refer to `package.json` and `.nvmrc`.

## 2. Writing Rules

### 2.1. Language

2.1.1. Documents of the repositories are written in English.

### 2.2. Precision

2.2.1. Name the file, class or function instead of describing it loosely.
2.2.2. Check every referenced name against the code of the branch the document ships with.

### 2.3. Diagrams

2.3.1. Flows, state transitions and topologies use Mermaid (`flowchart`, `sequenceDiagram`, `stateDiagram-v2`).

## 3. Workflow

### 3.1. Before Writing

3.1.1. Read the whole existing document before editing it, to keep its style and avoid duplicate sections.
3.1.2. Read the code the document describes.

### 3.2. Docs Follow Code

3.2.1. A change that alters behavior updates the matching document in the same pull request.
3.2.2. A statement is corrected by the pull request that makes it wrong, not before and not after.

### 3.3. Index

3.3.1. A new document is registered in [layout-and-index.md](./layout-and-index.md) in the same change.
3.3.2. A moved or deleted document is updated or removed in the index and in every link that pointed to it.

### 3.4. Specs

3.4.1. A feature or a change that spans several modules, or both backend and frontend, has a spec in `docs/specs/<feature-name>/` with `requirements.md`, `design.md` and `tasks.md`. What each file contains is in the [feature design guide](./04-business-logic/03-feature-design-guide.md).
3.4.2. Documentation changes and small fixes have no spec. The pull request description lists the acceptance criteria.
