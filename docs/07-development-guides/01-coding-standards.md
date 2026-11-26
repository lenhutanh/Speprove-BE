# Coding Standards

Rules for writing code in `speprove-be`. They describe what the code does today; a rule marked **target** is the direction of the refactor and is not yet true everywhere. The layering and the module boundaries are in [02-layers-and-modules.md](./02-layers-and-modules.md).

## 1. Tooling

### 1.1. Formatting and Lint

1.1.1. Prettier (`.prettierrc`): no semicolons, single quotes, 2 spaces, `printWidth` 120, no trailing comma, `arrowParens: always`.
1.1.2. ESLint (`eslint.config.mjs`): `typescript-eslint` recommended plus the Prettier plugin. `@typescript-eslint/no-explicit-any`, `no-unused-vars` and `prettier/prettier` are warnings, not errors. An unused parameter is allowed when its name starts with `_`.
1.1.3. A change must not add lint warnings. The current count is recorded in [the baseline](../plan/baseline-2026-11-22.md).
1.1.4. Do not reformat lines you do not change.

### 1.2. Commands

1.2.1. `pnpm lint`, `pnpm format`, `pnpm check` (ESLint plus the Prettier check), `pnpm build` (`tsc` plus `tsc-alias`), `pnpm test` (Vitest).
1.2.2. Before a pull request: `pnpm lint`, `pnpm build` and `pnpm test` pass.

## 2. TypeScript

2.1. `strict` is on (`tsconfig.json`). Import with the alias `~/*` (maps to `src/*`), not with long relative paths.
2.2. Do not add `any`. Use `unknown` with a type guard, a generic or a named type. A new `any` needs a comment with the reason. **Target:** `no-explicit-any` becomes an error for new code.
2.3. Do not add `eslint-disable`, `@ts-ignore` or `@ts-expect-error` without a one-line reason next to it.
2.4. Exported functions and methods of services and repositories declare their return type.
2.5. Use enums or `as const` objects for statuses and kinds, kept in the module's `*.constants.ts`. Do not compare against string literals scattered in the code.

## 3. Naming and Files

3.1. Files are `kebab-case` with a role suffix: `<module>.service.ts`, `.controller.ts`, `.route.ts`, `.validation.ts`, `.dto.ts`, `.mapper.ts`, `.model.ts`, `.repository.ts`, `.repository.interface.ts`, `.di.ts`, `.constants.ts`, `.type.ts`, `.util.ts`.
3.2. Classes are `PascalCase` (`PaymentService`); interfaces start with `I` (`IAccountRepository`); constants are `UPPER_SNAKE_CASE` (`PAYMENT_STATUS`).
3.3. REST resources are singular and `kebab-case` (`/speaking-session`, `/credit-package`).
3.4. One class per file. A file that grows past about 300 lines or a function past about 70 lines is a signal to split it, not a hard limit. **Target:** cyclomatic complexity of a function at most 12.
3.5. A name says what the thing is or does. Do not use `data`, `info`, `temp`, `helper`, `manager` as the whole name.

## 4. Errors

4.1. A business rule violation throws `AppError(message, statusCode, errorCode, errors?)` from `src/common/errors`. The full contract is in [the error code registry](../08-integration-contracts/02-error-codes.md).
4.2. Always pass an `errorCode` from `ErrorCodes`. Without it the response carries the default `SYS_001`, which is wrong for a client error.
4.3. Never catch an error only to swallow it. A `catch` either handles the error (and says how in a comment when it is not obvious), converts it to an `AppError`, or rethrows.
4.4. Controllers do not catch errors. `errorMiddleware` formats every error.

## 5. Logging

5.1. Use `logger` from `~/infrastructure/logging/logger`. Do not use `console.*` in `src/` (the exception is `src/scripts/`, which prints for a human).
5.2. The request id is added to every log line by the request context. Do not add it by hand.
5.3. Never log secrets, tokens, passwords, OTP codes or full request bodies. The logger redacts known keys; do not rely on that for new fields.
5.4. Levels: `error` for a failure that needs attention, `warn` for a handled abnormal case, `info` for a lifecycle event, `debug` for detail off in production.

## 6. Configuration and Secrets

6.1. Every setting is a variable validated in `src/common/config/env.config.ts` (Zod). The application stops at boot when a required variable is missing.
6.2. Read configuration through `env`, never from `process.env` in a module.
6.3. A new variable is added to the Zod schema and to `.env.example` in the same change, with a safe default or a comment.
6.4. Never commit `.env` or a real key. Never write a secret value in a document or a test.

## 7. Data Access

7.1. Only a module's own repository reads or writes its collections. Do not `.populate()` into another module's model (see [02-layers-and-modules.md](./02-layers-and-modules.md), section 3).
7.2. Repositories extend `BaseRepository`. Queries return plain objects (`lean`) unless `lean: false` is passed. A model with a `deletedAt` path is filtered by soft delete automatically.
7.3. A write that changes more than one document runs in a Mongo `session` transaction passed through `QueryOptions.session`.
7.4. A list endpoint paginates. `BaseRepository` caps the page size at 100.
7.5. A new query on a large collection has an index in the model. Do not add an index that a compound index already covers by prefix.

## 8. Comments

8.1. Comment the reason, not the action. Do not leave commented-out code; Git keeps history.
8.2. A `TODO` names what is missing and, when it exists, the finding or ticket.

## 9. Before Opening a Pull Request

- [ ] The change is one concern. A rename, a move and a logic change are separate commits.
- [ ] A test covers the behavior you changed or added ([testing strategy](../06-testing/01-testing-strategy.md)).
- [ ] `pnpm lint`, `pnpm build`, `pnpm test` pass.
- [ ] A document that the change makes wrong is updated in the same pull request ([guidelines](../docs-update-guidelines.md), section 3.2).
- [ ] The commit message follows Conventional Commits with a scope, for example `fix(payment): return 500 when webhook processing fails`.
