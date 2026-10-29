# Node 26 "Lithium" = current Active LTS. The floating 26-alpine tag picks up Node patch
# releases on every rebuild, and `apk upgrade` pulls Alpine security fixes on top.
ARG NODE_IMAGE=node:26-alpine

# ── deps: full install, shared by dev and build ───────────────────────────────
FROM ${NODE_IMAGE} AS deps
RUN apk upgrade --no-cache
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ── dev: hot reload, source is bind-mounted by docker-compose.dev.yml ─────────
FROM deps AS dev
ENV NODE_ENV=development
CMD ["npm", "run", "start:dev"]

# ── build: compile TypeScript ─────────────────────────────────────────────────
FROM deps AS build
COPY . .
RUN npm run build

# ── runner: production deps + compiled output only, non-root ──────────────────
FROM ${NODE_IMAGE} AS runner
RUN apk upgrade --no-cache
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
RUN mkdir -p logs && chown node:node logs
USER node

EXPOSE 4002
CMD ["node", "dist/main"]
