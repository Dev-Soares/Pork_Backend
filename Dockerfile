FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

# ─── Prod deps ───────────────────────────────────────────────────────────────
FROM base AS deps

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod
RUN pnpm add tsconfig-paths

# ─── Builder ─────────────────────────────────────────────────────────────────
FROM base AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm exec prisma generate
RUN pnpm run build

# ─── Production ──────────────────────────────────────────────────────────────
FROM node:22-alpine AS production

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/tsconfig.json ./tsconfig.json

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "-r", "tsconfig-paths/register", "dist/main.js"]
