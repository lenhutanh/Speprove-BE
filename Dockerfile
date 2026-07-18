# Build stage
FROM node:20-slim AS builder

RUN corepack enable

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json pnpm-lock.yaml tsconfig.json ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

RUN pnpm prune --prod

# Run stage
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

# Ffmpeg
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /app/logs \
    && chown -R node:node /app/logs

COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/package.json ./package.json

USER node

EXPOSE 8017

CMD ["node", "dist/index.js"]