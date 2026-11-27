# Endpoint Index

Every HTTP route of the backend, generated from the `*.route.ts` files of the branch this document ships with. The conventions (envelope, status codes, pagination) are in [01-api-conventions.md](./01-api-conventions.md); error codes are in [02-error-codes.md](./02-error-codes.md). All paths are under `/api/v1`.

## 1. How to Read It

| Column | Meaning |
| :--- | :--- |
| Auth | `public`: no token needed. `optional`: a token is read when present and the answer may differ for a signed-in user. `required`: a valid access token |
| Permission | The permission code that `hasPermission` checks ([security and RBAC](../03-architecture/01-security-and-rbac.md)). `-` means the route checks no permission |
| Limit | The rate limit as `limit, windowMs, action, strict` |
| Gap | `yes` marks a route that changes or lists data and has no permission check (section 4.1 of the security document) |

1.1. A route with Auth `required` and Permission `-` is available to every signed-in user; the service then restricts it to the user's own resources where that applies.
1.2. A permission check that exists in the code but is commented out is not shown, because it does not run. `GET /group` and `PUT /forecast/:id` are in that state and are not routes today.
1.3. This index is updated in the same change that adds, removes or protects a route.

## 2. Routes

### 2.1. `/account`

| Method | Path | Auth | Permission | Limit | Gap |
| :--- | :--- | :--- | :--- | :--- | :--- |
| GET | `/account` | required | ACCOUNT:VIEW:ALL | - |  |
| GET | `/account/me` | required | - | - |  |
| PUT | `/account/update-profile` | required | - | - |  |
| PUT | `/account/select-voice` | required | - | - |  |

### 2.2. `/attempt`

| Method | Path | Auth | Permission | Limit | Gap |
| :--- | :--- | :--- | :--- | :--- | :--- |
| POST | `/attempt` | required | - | - |  |
| GET | `/attempt` | required | - | - |  |
| GET | `/attempt/leaderboard` | public | - | - |  |
| PUT | `/attempt/:id/share` | required | - | - |  |
| GET | `/attempt/:id/word-audio` | required | - | - |  |
| POST | `/attempt/:id/retry` | required | - | - |  |
| GET | `/attempt/:id` | required | - | - |  |

### 2.3. `/auth`

| Method | Path | Auth | Permission | Limit | Gap |
| :--- | :--- | :--- | :--- | :--- | :--- |
| POST | `/auth/login` | public | - | 3, 10000, 'auth:login', true |  |
| POST | `/auth/register` | public | - | - |  |
| POST | `/auth/verify-register` | public | - | - |  |
| POST | `/auth/refresh` | public | - | 10, 10000, 'auth:refresh' |  |
| POST | `/auth/logout` | optional | - | - |  |
| POST | `/auth/forgot-password` | public | - | - |  |
| POST | `/auth/verify-forgot-password` | public | - | - |  |
| POST | `/auth/reset-password` | public | - | - |  |
| GET | `/auth/google` | public | - | - |  |
| GET | `/auth/google/callback` | public | - | - |  |
| PUT | `/auth/change-password` | required | - | - |  |
| PUT | `/auth/set-password` | required | - | - |  |
| POST | `/auth/socket-ticket` | required | - | - |  |

### 2.4. `/credit-log`

| Method | Path | Auth | Permission | Limit | Gap |
| :--- | :--- | :--- | :--- | :--- | :--- |
| GET | `/credit-log` | required | - | - |  |

### 2.5. `/credit-package`

| Method | Path | Auth | Permission | Limit | Gap |
| :--- | :--- | :--- | :--- | :--- | :--- |
| POST | `/credit-package` | required | - | - | yes |
| GET | `/credit-package` | public | - | - |  |

### 2.6. `/file`

| Method | Path | Auth | Permission | Limit | Gap |
| :--- | :--- | :--- | :--- | :--- | :--- |
| POST | `/file/upload-image` | required | - | - |  |
| POST | `/file/upload-audio` | required | - | - |  |

### 2.7. `/forecast-question`

| Method | Path | Auth | Permission | Limit | Gap |
| :--- | :--- | :--- | :--- | :--- | :--- |
| GET | `/forecast-question` | public | - | - |  |
| GET | `/forecast-question/:id` | public | - | - |  |
| POST | `/forecast-question/import` | required | - | - | yes |

### 2.8. `/forecast-topic`

| Method | Path | Auth | Permission | Limit | Gap |
| :--- | :--- | :--- | :--- | :--- | :--- |
| GET | `/forecast-topic` | public | - | - |  |
| GET | `/forecast-topic/:id` | public | - | - |  |

### 2.9. `/forecast`

| Method | Path | Auth | Permission | Limit | Gap |
| :--- | :--- | :--- | :--- | :--- | :--- |
| POST | `/forecast` | required | FORECAST:CREATE | - |  |
| GET | `/forecast` | optional | - | - |  |
| POST | `/forecast/import` | required | FORECAST:CREATE | - |  |
| GET | `/forecast/:id` | optional | - | - |  |
| POST | `/forecast/:id/import-topics` | required | - | - | yes |

### 2.10. `/group`

| Method | Path | Auth | Permission | Limit | Gap |
| :--- | :--- | :--- | :--- | :--- | :--- |
| POST | `/group` | required | GROUP:CREATE | - |  |
| GET | `/group/:id` | required | GROUP:VIEW | - |  |
| PUT | `/group/:id` | required | GROUP:UPDATE | - |  |
| DELETE | `/group/:id` | required | GROUP:DELETE | - |  |

### 2.11. `/payment`

| Method | Path | Auth | Permission | Limit | Gap |
| :--- | :--- | :--- | :--- | :--- | :--- |
| POST | `/payment/webhook/payos` | public | - | - |  |
| POST | `/payment` | required | - | - |  |
| GET | `/payment/:id` | required | - | - |  |

### 2.12. `/permission-group`

| Method | Path | Auth | Permission | Limit | Gap |
| :--- | :--- | :--- | :--- | :--- | :--- |
| POST | `/permission-group` | required | PERMISSION_GROUP:CREATE | - |  |
| GET | `/permission-group/:id` | required | PERMISSION_GROUP:VIEW | - |  |
| PUT | `/permission-group/:id` | required | PERMISSION_GROUP:UPDATE | - |  |
| DELETE | `/permission-group/:id` | required | PERMISSION_GROUP:DELETE | - |  |

### 2.13. `/permission`

| Method | Path | Auth | Permission | Limit | Gap |
| :--- | :--- | :--- | :--- | :--- | :--- |
| GET | `/permission` | required | PERMISSION:VIEW:ALL | - |  |
| POST | `/permission` | required | PERMISSION:CREATE | - |  |
| GET | `/permission/:id` | required | PERMISSION:VIEW | - |  |
| PUT | `/permission/:id` | required | PERMISSION:UPDATE | - |  |
| DELETE | `/permission/:id` | required | PERMISSION:DELETE | - |  |

### 2.14. `/question`

| Method | Path | Auth | Permission | Limit | Gap |
| :--- | :--- | :--- | :--- | :--- | :--- |
| POST | `/question` | required | QUESTION:CREATE | - |  |
| GET | `/question` | optional | - | - |  |
| GET | `/question/:id/audio` | public | - | - |  |
| PUT | `/question/:id` | required | QUESTION:UPDATE | - |  |

### 2.15. `/speaking-session`

| Method | Path | Auth | Permission | Limit | Gap |
| :--- | :--- | :--- | :--- | :--- | :--- |
| POST | `/speaking-session` | required | - | - |  |
| GET | `/speaking-session` | required | - | - |  |
| GET | `/speaking-session/active-session` | required | - | - |  |
| GET | `/speaking-session/:id/current-question` | required | - | - |  |
| POST | `/speaking-session/:id/retry` | required | - | - |  |
| GET | `/speaking-session/:id` | required | - | - |  |

### 2.16. `/topic`

| Method | Path | Auth | Permission | Limit | Gap |
| :--- | :--- | :--- | :--- | :--- | :--- |
| POST | `/topic` | required | TOPIC:CREATE | - |  |
| GET | `/topic` | optional | - | - |  |
| PUT | `/topic/:id` | required | TOPIC:UPDATE | - |  |

### 2.17. `/vocabulary-suggestion`

| Method | Path | Auth | Permission | Limit | Gap |
| :--- | :--- | :--- | :--- | :--- | :--- |
| GET | `/vocabulary-suggestion/approved` | public | - | - |  |
| GET | `/vocabulary-suggestion` | required | - | - | yes |
| POST | `/vocabulary-suggestion` | required | - | - | yes |
| PUT | `/vocabulary-suggestion/:id/approve` | required | - | - | yes |
| PUT | `/vocabulary-suggestion/:id/hide` | required | - | - | yes |
| GET | `/vocabulary-suggestion/:id/audio` | public | - | - |  |
| PUT | `/vocabulary-suggestion/:id` | required | - | - | yes |

### 2.18. `/voice-room`

| Method | Path | Auth | Permission | Limit | Gap |
| :--- | :--- | :--- | :--- | :--- | :--- |
| POST | `/voice-room/webhook` | public | - | - |  |
| GET | `/voice-room` | public | - | - |  |
| POST | `/voice-room` | required | - | - |  |
| GET | `/voice-room/:id` | optional | - | - |  |
| DELETE | `/voice-room/:id` | required | - | - |  |
| PATCH | `/voice-room/:id` | required | - | - |  |
| POST | `/voice-room/:id/join` | required | - | - |  |
| POST | `/voice-room/:id/leave` | required | - | - |  |
| PUT | `/voice-room/:id/pin-question` | required | - | - |  |
| DELETE | `/voice-room/:id/pin-question` | required | - | - |  |
| POST | `/voice-room/:id/transfer-host` | required | - | - |  |
| POST | `/voice-room/:id/mute-participant` | required | - | - |  |
| POST | `/voice-room/:id/unmute-participant` | required | - | - |  |
| POST | `/voice-room/:id/kick-participant` | required | - | - |  |

### 2.19. `/voice`

| Method | Path | Auth | Permission | Limit | Gap |
| :--- | :--- | :--- | :--- | :--- | :--- |
| POST | `/voice` | required | VOICE:CREATE | - |  |
| GET | `/voice` | public | - | - |  |
| PUT | `/voice/:id` | required | - | - | yes |
| PUT | `/voice/activate/:id` | required | VOICE:ACTIVATE | - |  |
| GET | `/voice/default` | public | - | - |  |
| GET | `/voice/:id/sample-audio` | public | - | - |  |

## 3. Outside `/api/v1`

| Method | Path | Purpose |
| :--- | :--- | :--- |
| GET | `/health` | Liveness |
| GET | `/ready` | Readiness (MongoDB, Redis) |
| GET | `/admin/queues` | Bull Board, only when `NODE_ENV` is not `production` |

## 4. Counts


95 routes: 24 public, 6 optional, 65 require a token; 22 check a permission; 9 are marked as gaps.
