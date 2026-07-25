FROM node:22-alpine

RUN apk add --no-cache python3 make g++

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile \
  --allow-build=@nestjs/core \
  --allow-build=@prisma/engines \
  --allow-build=@scarf/scarf \
  --allow-build=bcrypt \
  --allow-build=prisma \
  --allow-build=unrs-resolver

COPY . .
RUN pnpm exec prisma generate
RUN pnpm run build

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "-r", "tsconfig-paths/register", "dist/src/main.js"]
