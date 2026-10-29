# Nest Boiler Plate

NestJS 10 + MongoDB backend starter (Node 26 LTS) with JWT auth (email OTP), users, role/permission RBAC, notifications, and an example CRUD module to copy.

## Getting started

### With Docker (recommended)

```bash
bash setup.sh --dev     # first run creates .env from .env.example. Edit it, then run again
```

This starts the app with hot reload and a local MongoDB. Without Mailgun keys, emails (including OTP codes) appear in the logs:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f app
docker compose -f docker-compose.yml -f docker-compose.dev.yml down
```

Production: set `NODE_ENV=production`, a 32+ char `JWT_TOKEN_KEY`, a real `DATABASE_LINK` and the Mailgun keys in `.env`, then run `bash setup.sh`.

### Without Docker

```bash
cp .env.example .env     # point DATABASE_LINK at your MongoDB
npm install
npm run start:dev
```

### Endpoints

- Landing page: http://localhost:4002
- Swagger (non-production only): http://localhost:4002/api
- Health: `GET /ping`

Create the first admin with `POST /auth/seed-admin`, then log in with `POST /auth/login`.

## Docs

[CLAUDE.md](./CLAUDE.md) covers the architecture, conventions, auth model, Docker setup, and how to add a module.
