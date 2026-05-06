FROM oven/bun:1.3.10

WORKDIR /app
ENV APP_ENV=production

COPY package.json bun.lock tsconfig.json ./
COPY apps/server/package.json ./apps/server/package.json
COPY apps/example-vue/package.json ./apps/example-vue/package.json
COPY apps/example-uniapp/package.json ./apps/example-uniapp/package.json
COPY packages/core/package.json ./packages/core/package.json
COPY packages/frontend-react/package.json ./packages/frontend-react/package.json
COPY packages/frontend-vue/package.json ./packages/frontend-vue/package.json
COPY packages/persistence/package.json ./packages/persistence/package.json
COPY packages/schema/package.json ./packages/schema/package.json
COPY packages/generator/package.json ./packages/generator/package.json
COPY packages/ui-core/package.json ./packages/ui-core/package.json
COPY packages/ui-enterprise-vue/package.json ./packages/ui-enterprise-vue/package.json

RUN bun install --frozen-lockfile --production --ignore-scripts

COPY apps/server/src ./apps/server/src
COPY packages/core/src ./packages/core/src
COPY packages/generator/src ./packages/generator/src
COPY packages/persistence/src ./packages/persistence/src
COPY packages/schema/src ./packages/schema/src

EXPOSE 3000

CMD ["bun", "--filter", "@elysian/server", "start"]
