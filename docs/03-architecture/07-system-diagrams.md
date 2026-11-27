# System Diagrams

Four views of the system: context, components, request and scoring flow, and deployment. They describe the code of the branch this document ships with. The data model has its own diagram in [the data dictionary](./06-data-dictionary.md); the scoring and payment sequences are in [AI scoring](../04-business-logic/01-ai-scoring.md) and [payment and credit](../04-business-logic/02-payment-and-credit.md) and are not repeated here. The long-term target (microservices) is in `architecture_roadmap.md` in the workspace folder.

## 1. Context

Who and what the system talks to.

```mermaid
flowchart LR
    L["Learner (browser)"]
    A["Administrator (browser)"]
    FE["Frontend (Next.js)"]
    BE["Backend API (Express, this repository)"]
    DB[("MongoDB")]
    RD[("Redis")]
    GQ["Groq: speech to text, LLM"]
    AZ["Azure Speech: pronunciation assessment"]
    ET["Edge TTS: question audio"]
    PO["PayOS: payments"]
    BR["Brevo: email"]
    CL["Cloudinary: files"]
    GO["Google: sign-in"]
    LK["LiveKit: voice rooms"]

    L --> FE
    A --> FE
    FE -->|"REST /api/v1 and Socket.io"| BE
    FE -->|"audio and video"| LK
    BE --> DB
    BE --> RD
    BE --> GQ
    BE --> AZ
    BE --> ET
    BE --> PO
    PO -->|"webhook"| BE
    BE --> BR
    BE --> CL
    BE --> GO
    BE -->|"tokens, room control"| LK
    LK -->|"webhook"| BE
```

1.1. The browser talks only to the frontend and, for voice rooms, to LiveKit. Every third-party key stays in the backend ([configuration](../09-operations/01-configuration-reference.md), section 7).
1.2. Payment and LiveKit call the backend back through a webhook (`POST /payment/webhook/payos`, `POST /voice-room/webhook`).

## 2. Components

The modules of `src/modules`, grouped by domain, and the shared parts.

```mermaid
flowchart TB
    subgraph IAM["Identity and access"]
        account
        account-provider
        auth
        session
        permission
        permission-group
        group
    end
    subgraph CNT["Content"]
        forecast
        forecast-topic
        forecast-question
        topic
        question
        vocabulary-suggestion
    end
    subgraph PRC["Practice and scoring"]
        speaking-session
        attempt
    end
    subgraph BIL["Billing"]
        payment
        credit-package
        credit-log
    end
    subgraph MED["Files and audio"]
        file
        voice
        generated-audio
        speech
    end
    subgraph VRM["Voice rooms"]
        voice-room
    end
    subgraph INF["Shared infrastructure"]
        queues["queues and workers (BullMQ)"]
        socket["Socket.io"]
        providers["providers: Groq, Azure, Cloudinary, Brevo, ffmpeg"]
        cache["cache, rate limiter (Redis)"]
        logging["logging, request context"]
    end

    PRC --> BIL
    PRC --> CNT
    PRC --> MED
    PRC --> INF
    BIL --> IAM
    IAM --> INF
    VRM --> CNT
    VRM --> IAM
    MED --> INF
```

2.1. An arrow means "uses the service of". Several arrows break the module rules (a module reading another's collection, finding F1); the target layout and the rules are in [layers and modules](../07-development-guides/02-layers-and-modules.md).
2.2. `mail` and `speech` are thin modules; mail is sent through the mail queue.

## 3. Layers Inside One Request

```mermaid
sequenceDiagram
    participant C as Client
    participant R as Router and middlewares
    participant CT as Controller
    participant S as Service
    participant RP as Repository
    participant DB as MongoDB
    participant Q as Queue
    C->>R: HTTP request
    R->>R: request id, helmet, CORS, rate limit, auth, permission, validation
    R->>CT: validated request
    CT->>S: call with typed input
    S->>RP: query or transaction
    RP->>DB: read or write
    S->>Q: enqueue long work (optional)
    S-->>CT: result
    CT-->>C: envelope with data, or error from errorMiddleware
```

## 4. Deployment

### 4.1. Today

```mermaid
flowchart LR
    DEV["Developer"] -->|"push, pull request"| GH["GitHub"]
    GH -->|"CI: lint, build, test, audit, gitleaks"| CI["GitHub Actions"]
    IMG["Docker image node:24-slim plus ffmpeg"] --> RUN["One Node process: API, workers, Socket.io, port 8017"]
    RUN --> DB[("MongoDB replica set (cloud)")]
    RUN --> RD[("Redis (cloud)")]
    RUN --> EXT["Third-party services"]
```

4.1.1. The backend is one container: HTTP API, BullMQ workers and Socket.io run in the same process (see [queues and realtime](./05-queues-and-realtime.md)). The image runs as the non-root `node` user and has a `HEALTHCHECK` on `/health`.
4.1.2. MongoDB and Redis are external. `docker-compose.dev.yaml` starts only the API.
4.1.3. The CI workflow is in `.github/workflows/ci.yml`. There is no automatic deploy yet.

### 4.2. Planned

4.2.1. A staging environment reachable from outside, with the backend and frontend images built by the pipeline, secrets in the platform's secret store, a health check after each deploy and a rollback to the previous image. The host, registry and trigger are decided in the `ci-cd-staging` ticket; this section is rewritten when they exist.
