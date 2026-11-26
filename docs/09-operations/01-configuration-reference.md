# Configuration Reference

Every environment variable of the backend. The source of truth is the Zod schema in `src/common/config/env.config.ts`; `.env.example` lists the same names. The application stops at boot when a required variable is missing or malformed. A value is never written in a document: this table gives names, defaults and meaning only.

## 1. How Configuration Works

1.1. `env.config.ts` validates `process.env` once at startup and exports `env`. Modules read `env`, never `process.env`.
1.2. In `NODE_ENV=test` the third-party keys are optional and get placeholders, so the test suite runs without secrets.
1.3. A new variable is added to the schema and to `.env.example` in the same change ([coding standards](../07-development-guides/01-coding-standards.md), section 6).

## 2. Application

| Variable | Required | Default | Meaning |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | no | `development` | `development`, `production` or `test`. Production forces `APP_HOST` to `0.0.0.0` and enables `secure` cookies |
| `APP_NAME` | yes | | Application name |
| `APP_URL` | yes | | Public URL of the frontend (a valid URL) |
| `APP_HOST` | no | `localhost` | Bind address |
| `APP_PORT` | no | `5000` | Port. The Docker image sets `8017` |
| `PORT` | no | | When set, overrides `APP_PORT` (platforms that inject a port) |
| `CORS_ORIGINS` | no | `http://localhost:3000` | Comma-separated list of allowed origins. A request from another origin is refused with 403 |
| `TRUST_PROXY` | no | `0` | Number of reverse proxies in front of the app (`trust proxy`); set it when behind a load balancer so rate limiting sees the client IP |
| `AUTHOR` | no | empty | Not read by any module since Swagger was removed; to be deleted |
| `LOG_LEVEL` | no | `info` | `error`, `warn`, `info`, `http` or `debug` |

## 3. Timeouts

| Variable | Default | Used by |
| :--- | :--- | :--- |
| `HTTP_TIMEOUT_MS` | `30000` | LiveKit, PayOS, the Azure audio download |
| `AI_TIMEOUT_MS` | `60000` | Groq speech to text and Groq LLM calls |
| `SHUTDOWN_TIMEOUT_MS` | `15000` | Upper bound of the graceful shutdown before the process exits |

## 4. MongoDB

| Variable | Required | Default | Meaning |
| :--- | :--- | :--- | :--- |
| `MONGODB_URI` | yes | | Connection string. Must point to a replica set (transactions) |
| `DATABASE_NAME` | yes | | Database name. One database per environment |
| `MONGO_MAX_POOL_SIZE` | no | `20` | Connection pool size |
| `MONGO_SERVER_SELECTION_TIMEOUT_MS` | no | `10000` | Time to wait for a server before failing |

## 5. Redis

| Variable | Required | Default | Meaning |
| :--- | :--- | :--- | :--- |
| `REDIS_URL` | no | | `redis://` or `rediss://` (TLS). **Takes precedence** over the three variables below |
| `REDIS_HOST` | no | `127.0.0.1` | Host |
| `REDIS_PORT` | no | `6379` | Port |
| `REDIS_PASSWORD` | no | empty | Password |

## 6. Authentication

| Variable | Required | Meaning |
| :--- | :--- | :--- |
| `ACCESS_TOKEN_SECRET_SIGNATURE` | yes, at least 32 characters | Signs access tokens |
| `REFRESH_TOKEN_SECRET_SIGNATURE` | yes, at least 32 characters | Signs refresh tokens. Different from the access secret |
| `ACCESS_TOKEN_LIFE` | yes | Lifetime of the access token (for example `15m`) |
| `REFRESH_TOKEN_LIFE` | yes | Lifetime of the refresh token and of the session (for example `7d`) |
| `ACCESS_TOKEN_COOKIE_LIFE` | yes | Lifetime of the access-token cookie |

6.1. The details of the flow are in [authentication](../03-architecture/02-authentication.md).

## 7. Third-Party Services

Required in every environment except `test`.

| Service | Variables | Used for |
| :--- | :--- | :--- |
| Brevo | `BREVO_API_KEY`, `SENDER_EMAIL`, `SENDER_NAME` | OTP and notification email |
| Cloudinary | `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Audio and image storage |
| Groq | `GROQ_API_KEY` | Speech to text and the scoring LLM |
| Azure Speech | `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION` | Pronunciation assessment and text to speech |
| PayOS | `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY` | Payment creation and webhook signature |
| Google | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` | Sign in with Google |
| LiveKit | `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` | Voice rooms. Optional: without them the voice-room features fail when used |

## 8. Per Environment

| Environment | Rules |
| :--- | :--- |
| Local | Values in `.env` (ignored by Git). Cloud MongoDB and Redis are fine |
| Test | Set by `vitest.config.mts`; no real services |
| Staging, production | Values come from the platform's secret store (GitHub Environments or the host), never from a file in the repository. One database and one account per environment. `NODE_ENV=production`, `TRUST_PROXY` set to the number of proxies, `CORS_ORIGINS` set to the frontend origin |

8.1. Secrets are rotated when a person who knew them leaves or when one appears in a log, a commit or a screenshot. A leaked key is revoked first, then removed from history.
