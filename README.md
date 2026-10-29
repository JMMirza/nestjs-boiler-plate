# Nest Boiler Plate

NestJS 10 + MongoDB backend starter with JWT auth (email OTP), users, role/permission RBAC, notifications, and an example CRUD module to copy.

## Getting started

```bash
cp .env.example .env     # fill in JWT_TOKEN_KEY, DATABASE_LINK, Mailgun keys
npm install
npm run start:dev
```

- API: http://localhost:4002
- Swagger: http://localhost:4002/api
- Health: `GET /ping`

Create the first admin with `POST /auth/seed-admin`, then log in with `POST /auth/login`.

## Docs

[CLAUDE.md](./CLAUDE.md) covers the architecture, conventions, auth model, and how to add a module.
