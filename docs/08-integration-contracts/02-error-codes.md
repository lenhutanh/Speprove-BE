# Error Codes

The registry of error codes returned in `errorCode`. The source of truth is `src/common/constants/error-codes.ts` (`ErrorCodes`); this document explains it. The envelope is in [01-api-conventions.md](./01-api-conventions.md).

## 1. How an Error Reaches the Client

1.1. A service throws `AppError(message, statusCode, errorCode, errors?)`. `errorMiddleware` answers with the same status and code.
1.2. `errorMiddleware` also converts three kinds of error itself:

| Error | Status | `errorCode` |
| :--- | :--- | :--- |
| `ZodError` (request validation) | 422 | `REQ_001` |
| Mongoose `ValidationError` | 400 | `REQ_001` |
| Mongo duplicate key (code 11000) | 409 | `RES_002` |
| Anything else | 500 | `SYS_001` |

1.3. When `errorCode` is omitted, `AppError` defaults to `SYS_001`. See section 4.

## 2. Registry

### 2.1. System (`SYS_`)

| Code | Name | Meaning |
| :--- | :--- | :--- |
| `SYS_001` | `INTERNAL_SERVER_ERROR` | Unexpected failure, or an error thrown without a code |
| `SYS_002` | `MAINTENANCE_MODE` | Reserved |
| `SYS_003` | `TOO_MANY_REQUESTS` | Rate limit exceeded (429) |

### 2.2. Request (`REQ_`)

| Code | Name | Meaning |
| :--- | :--- | :--- |
| `REQ_001` | `VALIDATION_ERROR` | Input failed validation; `errors` lists the fields |
| `REQ_002` | `BAD_REQUEST` | Malformed request |
| `REQ_003` | `PAYLOAD_TOO_LARGE` | Reserved |
| `REQ_004` | `UNSUPPORTED_MEDIA_TYPE` | Reserved |

### 2.3. Resource (`RES_`)

| Code | Name | Meaning |
| :--- | :--- | :--- |
| `RES_001` | `NOT_FOUND` | The resource does not exist (or is not visible to the caller) |
| `RES_002` | `DUPLICATE_ENTRY` | A unique value already exists |
| `RES_003` | `CONFLICT` | The state does not allow the action |
| `RES_004` | `RESOURCE_GONE` | Reserved |

### 2.4. Authentication (`AUTH_`)

| Code | Name | Meaning |
| :--- | :--- | :--- |
| `AUTH_001` | `UNAUTHORIZED` | Not signed in |
| `AUTH_002` | `FORBIDDEN` | Signed in, action not allowed |
| `AUTH_003` | `INVALID_TOKEN` | Token cannot be verified |
| `AUTH_004` | `TOKEN_EXPIRED` | Access token expired; the client refreshes |
| `AUTH_005` | `SESSION_EXPIRED` | Session no longer valid |
| `AUTH_006` | `SESSION_REPLACED` | The account signed in elsewhere |
| `AUTH_007` | `TOKEN_MISSING` | No token sent |
| `AUTH_008` | `OAUTH_STATE_INVALID` | Google sign-in state check failed |
| `AUTH_009` | `GOOGLE_EMAIL_NOT_VERIFIED` | Google email not verified |
| `AUTH_010` | `GOOGLE_ACCOUNT_CONFLICT` | The email belongs to another sign-in method |
| `AUTH_011` | `GOOGLE_ACCOUNT_MISMATCH` | Reserved |
| `AUTH_012` | `GOOGLE_TOKEN_INVALID` | Google token rejected |
| `AUTH_013` | `TOKEN_REUSED` | A refresh token was used twice |

### 2.5. Permission (`PERM_`)

| Code | Name | Meaning |
| :--- | :--- | :--- |
| `PERM_001` | `PERMISSION_DENIED` | The user lacks a required permission |
| `PERM_002` | `ROLE_NOT_ALLOWED` | Reserved |

### 2.6. Account (`ACC_`)

| Code | Name | Meaning |
| :--- | :--- | :--- |
| `ACC_001` | `ACCOUNT_NOT_VERIFIED` | Email not verified by OTP |
| `ACC_002` | `ACCOUNT_LOCKED` | Account is locked |
| `ACC_003` | `INVALID_CREDENTIALS` | Wrong email or password |
| `ACC_004` | `OTP_INVALID` | Wrong OTP |
| `ACC_005` | `OTP_EXPIRED` | OTP expired |

### 2.7. Business (`BUS_`)

| Code | Name | Meaning |
| :--- | :--- | :--- |
| `BUS_001` | `BUSINESS_RULE_VIOLATION` | A rule of the domain refuses the action |
| `BUS_002` | `OPERATION_NOT_ALLOWED` | The current state does not allow the operation |
| `BUS_003` | `INSUFFICIENT_BALANCE` | Not enough credit (400) |

### 2.8. External (`EXT_`)

| Code | Name | Meaning |
| :--- | :--- | :--- |
| `EXT_001` | `EXTERNAL_SERVICE_ERROR` | A third-party service failed |
| `EXT_002` | `SERVICE_TIMEOUT` | A third-party service timed out |

2.9. These codes are defined and not referenced anywhere else in `src` today: `MAINTENANCE_MODE`, `BAD_REQUEST`, `PAYLOAD_TOO_LARGE`, `UNSUPPORTED_MEDIA_TYPE`, `CONFLICT`, `RESOURCE_GONE`, `UNAUTHORIZED`, `GOOGLE_ACCOUNT_MISMATCH`, `PERMISSION_DENIED`, `ROLE_NOT_ALLOWED`, `OTP_INVALID`, `OTP_EXPIRED`, `BUSINESS_RULE_VIOLATION`, `OPERATION_NOT_ALLOWED`, `EXTERNAL_SERVICE_ERROR`, `SERVICE_TIMEOUT`. The meaning in the tables above is the intended one; use them instead of adding a new code.

## 3. Adding a Code

3.1. Add it to `ErrorCodes` in the right group, with the next number of that group.
3.2. Add a row to the table above in the same change.
3.3. Throw it with the status that fits (table in [01-api-conventions.md](./01-api-conventions.md), section 3).
3.4. Add a test that checks the status and the `errorCode`.

## 4. Known Deviations

These are true on the branch this document ships with. A change that fixes one removes it from this list.

4.1. Most `new AppError(message, status)` calls omit the code, so the response carries `SYS_001` even for a client error. A client should treat the HTTP status as the reliable signal until these are fixed.
4.2. `authMiddleware.hasPermission` answers `403` without `PERM_001`, so the code is `SYS_001`.
4.3. The PayOS webhook controller answers `200` for every outcome, including a bad signature and a processing failure (finding F2), so a failed webhook is not retried by PayOS.
4.4. Some services answer `403` for another user's resource, where the target is `404` (finding F6).
