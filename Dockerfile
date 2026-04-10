FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

# ─── Builder ────────────────────────────────────────────────────────────────
FROM base AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm exec prisma generate
RUN pnpm run build
RUN pnpm prune --prod

# ─── Production ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS production

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/tsconfig.json ./tsconfig.json

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "-r", "tsconfig-paths/register", "dist/main.js"]
