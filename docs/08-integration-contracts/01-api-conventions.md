# API Conventions

The contract between the backend and any client (the web frontend, tests, tools). Error codes are in [02-error-codes.md](./02-error-codes.md). The frontend mirrors this contract in its `api-config`, `api-requests`, `queries` and `types` chain; a change here is made in both repositories.

## 1. Request

1.1. Base path: `/api/v1`. Resources are singular and `kebab-case` (`/attempt`, `/speaking-session`, `/credit-package`).
1.2. Authentication: the access token travels in the `accessToken` cookie or in `Authorization: Bearer <token>`. Public routes need none. Optional-auth routes accept both a guest and a user.
1.3. Content type: `application/json`, except uploads (`multipart/form-data`).
1.4. Every request gets an id. The response carries it in error bodies as `requestId`; quote it when reporting a problem.
1.5. Input is validated by a Zod schema over `{ body, params, query }`. The controller reads the result from `req.validated`.

### 1.1. Pagination

1.1.1. A list endpoint takes `page` (from 1, default 1) and `limit` (1 to 100, default 12), and usually `sortBy` (default `createdAt`), `sortOrder` (`asc` or `desc`, default `asc`) and `search`.
1.1.2. A list answers with the paginated envelope of section 2.2.

## 2. Response

All responses are JSON built by `ResponseTransformer` (`src/core/http/response-transformer.util.ts`).

### 2.1. Success

```json
{ "success": true, "message": "Get payment details successfully", "data": { } }
```

2.1.1. `data` is absent when the action returns nothing (`successNoData`).
2.1.2. A create answers `201`, every other success `200`.

### 2.2. Paginated Success

```json
{
  "success": true,
  "message": "Get list successfully",
  "data": [ ],
  "meta": { "page": 1, "limit": 20, "total": 134, "totalPages": 7, "hasNext": true, "hasPrev": false }
}
```

### 2.3. Error

```json
{
  "success": false,
  "message": "Validation failed",
  "errorCode": "REQ_001",
  "errors": { "email": "Invalid email" },
  "requestId": "..."
}
```

2.3.1. `errorCode` is one of the codes in [the registry](./02-error-codes.md). A client branches on `errorCode`, not on `message`.
2.3.2. `errors` is present for validation errors and maps a field path to a message.
2.3.3. In development an unexpected error also carries `errors.stack`. Never in production.

## 3. Status Codes

| Status | Used for | Source |
| :--- | :--- | :--- |
| 200, 201 | Success, creation | controllers |
| 400 | Business rule violation, Mongoose validation error, `INSUFFICIENT_BALANCE` | services, `errorMiddleware` |
| 401 | Missing, invalid, expired or replaced token; bad Google token | `authMiddleware`, `auth` module |
| 403 | Missing permission, locked account | `hasPermission`, services |
| 404 | Resource not found | services |
| 409 | Duplicate key (Mongo error 11000), account conflict | `errorMiddleware`, `auth` |
| 422 | Zod validation failed on `body`, `params` or `query` | `errorMiddleware` |
| 429 | Rate limit exceeded | `rateLimitMiddleware` |
| 500 | Unexpected error | `errorMiddleware` |

3.1. A resource of another user is answered `404` (**target**: an anti-enumeration rule; today some services answer `403`, finding F6).

## 4. Rate Limiting

4.1. `rateLimitMiddleware(limit, windowMs, actionName, isStrict)` is applied per route, keyed by user id or IP. Today it protects `/auth/login` and `/auth/refresh`.
4.2. A limited request answers `429` with `errorCode` `SYS_003` and the headers `X-RateLimit-Limit`, `X-RateLimit-Remaining` and `Retry-After`.

## 5. Endpoints Outside `/api/v1`

| Path | Purpose |
| :--- | :--- |
| `GET /health` | Liveness: `200 { status: "ok", uptimeSeconds }`, no dependency is checked |
| `GET /ready` | Readiness: pings MongoDB and Redis. `200 { status: "ok", dependencies: { mongo: "ok", redis: "ok" } }`, or `503 { status: "unavailable", ... }` with `"down"` for the failing one |

## 6. Realtime

6.1. Scoring progress and voice-room events are sent through Socket.io. The event names and payloads of scoring are in [the AI scoring flow](../04-business-logic/01-ai-scoring.md).

## 7. Changing the Contract

7.1. A change to a path, a field, a status code or an error code updates this document and the frontend chain in the same change.
7.2. Do not add an endpoint the interface does not use.
7.3. Do not rename or remove a field a client reads without a deprecation step agreed with the frontend.
