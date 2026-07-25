FROM node:22-alpine

RUN apk add --no-cache python3 make g++

RUN npm install -g pnpm@9.15.9

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm exec prisma generate
RUN pnpm run build

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "-r", "tsconfig-paths/register", "dist/src/main.js"]
