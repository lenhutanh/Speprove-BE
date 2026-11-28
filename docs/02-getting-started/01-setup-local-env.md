# Local Setup

How to get `speprove-be` running on a development machine, and how to check that it works. Every variable is explained in [the configuration reference](../09-operations/01-configuration-reference.md).

## 1. Requirements

| Requirement | Notes |
| :--- | :--- |
| Node.js | The version in `.nvmrc` (use `nvm use`) |
| pnpm | The version in the `packageManager` field of `package.json` (`corepack enable`) |
| MongoDB | A **replica set**, because payment and credit use transactions. A free cloud cluster works; a standalone local `mongod` does not |
| Redis | Used by BullMQ, the cache, the rate limiter and OTP storage. A local Redis or a cloud URL |
| `ffmpeg` | Needed locally only for audio upload and conversion; the Docker image installs it |
| Third-party keys | Brevo, Cloudinary, Groq, Azure Speech, PayOS, Google OAuth; LiveKit only for voice rooms |

1.1. Do not copy `node_modules` between operating systems. Native packages differ; run the install on the machine that will run the code.

## 2. Steps

```bash
pnpm install --frozen-lockfile
cp .env.example .env        # then fill in the values
pnpm dev                    # nodemon, listens on APP_PORT (default 5000)
```

2.1. Never commit `.env`. Never paste a real key into a document, a test or a commit.
2.2. Choose the access and refresh token secrets yourself; each must be at least 32 characters.
2.3. In development the app starts even when a third-party key is a placeholder, but the feature that uses it fails when called.

## 3. Check That It Works

| Check | Expected |
| :--- | :--- |
| `GET http://localhost:5000/health` | `200`, the process is alive |
| `GET http://localhost:5000/ready` | `200` when MongoDB and Redis answer; `503` otherwise, with the state of each |
| Start the frontend, register, verify the OTP, sign in | A session cookie is set and `/api/v1/account/me` answers |

3.1. If the process exits at boot, the log prints the invalid variable (the schema is in `src/config/env.config.ts`).

## 4. Tests

```bash
pnpm test
```

4.1. The tests use an in-memory MongoDB replica set and fakes for Redis and the queues. They do not read `.env` and do not touch a real database. The first run downloads a MongoDB binary of several hundred megabytes; set `MONGOMS_DOWNLOAD_DIR` to choose where. See [the testing strategy](../06-testing/01-testing-strategy.md).

## 5. Docker

```bash
docker compose -f docker-compose.dev.yaml up --build
```

5.1. The compose file runs only the API, on port `8017`, and reads `.env`. MongoDB and Redis are not part of it: point `MONGODB_URI` and `REDIS_URL` at running instances that the container can reach.
5.2. The image has a `HEALTHCHECK` on `/health`; `docker ps` shows `healthy` once the app answers.

## 6. Seed Data

6.1. `pnpm db:seed` **deletes collections** in the database named by `DATABASE_NAME` before inserting, and creates a super admin with a fixed password. Run it only against a database you can lose. Never run it against a shared or production database.

## 7. Common Problems

| Symptom | Cause and fix |
| :--- | :--- |
| `Invalid environment variables` at boot | A required variable is missing or malformed; read the printed field |
| `Cannot find native binding` when running tests | `node_modules` was installed on another operating system; delete it and run `pnpm install --frozen-lockfile` |
| Transactions fail with a "replica set" error | `MONGODB_URI` points to a standalone server; use a replica set |
| Cookies are not sent from the frontend | `CORS_ORIGINS` must list the frontend origin exactly; in production the cookies need HTTPS (`secure`, `sameSite=none`) |
| `/ready` answers `503` | MongoDB or Redis is unreachable; the body says which |
