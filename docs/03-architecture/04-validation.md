# Validation

Where input is checked and what each check is for. Validation answers "is this request well formed"; business rules ("is the balance enough", "does this user own the attempt") belong to the service. The envelope and status of a failure are in [API conventions](../08-integration-contracts/01-api-conventions.md).

## 1. Layers of Validation

| Layer | Checks | Failure |
| :--- | :--- | :--- |
| Zod schema (`*.validation.ts`) | Shape, types, lengths, formats, cross-field rules of `body`, `params`, `query` | `422`, `REQ_001`, field map in `errors` |
| Upload middleware (`file.middleware.ts`) | Size, MIME type, extension, and the real type of the file bytes | `4xx` from the middleware |
| Service | Business rules and ownership | `AppError` with a status and a code |
| Mongoose schema | Required fields, `unique`, `lowercase`, `trim`, enum values | `400` (validation) or `409` (duplicate key) through `errorMiddleware` |

1.1. The Zod layer is the first line. The Mongoose layer is a safety net, not the way to produce a good message.

## 2. Writing a Schema

2.1. Build a schema with the helpers in `src/common/base/base.validation.ts`:

| Helper | Wraps |
| :--- | :--- |
| `createSchema(fields)` | `{ body }` with unknown keys stripped |
| `updateSchema(fields)` | `{ params: { id? }, body }` |
| `querySchema(filterFields)` | `{ query }` with the paging fields below plus the filters |
| `simpleQuerySchema(fields)` | `{ query }` without paging |
| `idParamSchema` | `{ params: { id } }` where `id` is a valid ObjectId |

2.2. Paging fields in `querySchema`: `page` (at least 1, default 1), `limit` (1 to 100, default 12), `sortBy` (default `createdAt`), `sortOrder` (`asc` or `desc`, default `asc`), `search` (optional).
2.3. Reusable field schemas (`emailSchema`, `passwordSchema`, `otpSchema`, `objectIdSchema`) are in `src/common/utils/validators.util.ts`. Reuse them; do not repeat a regular expression.
2.4. A cross-field rule uses `.refine(...)` with a `path` that points to the field the user must fix (`['body', 'confirmPassword']`).
2.5. Unknown keys are stripped (`.strip()`), so a client cannot write a field the schema does not name.

## 3. Applying It

3.1. A route adds `validateMiddleware(schema)` after authentication and permission checks. The middleware parses `{ body, params, query }` together and stores the result in `req.validated`.
3.2. A controller reads `req.validated.body`, `req.validated.params`, `req.validated.query`. It never reads `req.body` for a route that has a schema.
3.3. Parsed values are coerced (`page` becomes a number), so the service receives typed input.

## 4. Error Shape

4.1. A `ZodError` becomes `422` with `errorCode` `REQ_001`. `errors` maps the field path, without the `body.`, `params.` or `query.` prefix, to the message: `{ "email": "Invalid email" }`.
4.2. The frontend maps `errors` onto form fields.
4.3. Some messages are written in Vietnamese because they are shown to the user (for example the password confirmation message). A message the user will see is written in the language of the interface.

## 5. Rules

5.1. Every route that takes input has a schema. A route that takes none says so.
5.2. Limits are explicit: a maximum length on every free-text field, a maximum on every list.
5.3. Validate on the server even when the frontend validates.
5.4. Never put a business rule or a database call in a schema; a schema that queries MongoDB slows every request and hides the rule.
