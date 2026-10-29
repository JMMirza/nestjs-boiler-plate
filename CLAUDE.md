# CLAUDE.md

Guidance for Claude Code sessions and new developers working in this repository.

## What this is

A **NestJS 10 + MongoDB (Mongoose 8)** backend boilerplate on **Node 26 LTS** (see `.nvmrc` and `engines`). It ships with:

- JWT auth: signup, login, email OTP verification, forgot/reset/change password, one-time admin seed
- Users: profile, settings, admin user management
- RBAC: roles and permissions (admin-only CRUD)
- Notifications: in-app notifications with read tracking, optional email fan-out
- An `example` module: a minimal CRUD module to copy when adding features
- A NestJS-themed landing page at `GET /` (`modules/app/landing-page.ts`) with a live `/ping` status and an endpoint overview

It is not tied to any business domain. Add domain features as new modules (see "Adding a module").

## Commands

### Docker (recommended)

Docker is fully set up: `Dockerfile`, `docker-compose.yml`, `docker-compose.dev.yml` and `setup.sh`.

```bash
bash setup.sh --dev   # local dev: app (hot reload) + MongoDB container
bash setup.sh         # production: app only, DB via DATABASE_LINK
```

The first run copies `.env.example` to `.env` and exits. Fill in `.env`, then run the script again. See "Docker setup" below for the details.

```bash
# Dev stack (always pass both files)
docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f app
docker compose -f docker-compose.yml -f docker-compose.dev.yml ps
docker compose -f docker-compose.yml -f docker-compose.dev.yml down      # stop
docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v   # stop + wipe Mongo data

# Production stack
docker compose logs -f app
docker compose down
```

### Without Docker

```bash
npm install
npm run start:dev     # watch mode
npm run build         # compile to dist/
npm run start:prod    # node dist/main
npm run lint          # eslint --fix
npm run format        # prettier
npm run test          # jest unit tests (*.spec.ts under src/)
```

The app listens on `PORT` (default `4002`). Swagger UI is at `/api` when `NODE_ENV !== 'production'`. Health check: `GET /ping`.

Use Node 26 locally (`nvm use` reads `.nvmrc`). Without Docker you need your own MongoDB. Set `DATABASE_LINK=mongodb://localhost:27017` in `.env`.

## Environment

Copy `.env.example` to `.env`. All env access goes through `src/config.ts`. Add new variables there, not as scattered `process.env` reads.

| Variable | Purpose |
|----------|---------|
| `NODE_ENV` | `production` disables Swagger |
| `PORT` | HTTP port |
| `SERVICE_NAME` | Logger context name |
| `CORS_ORIGINS` | Comma-separated allowed origins |
| `MONGO_PORT` | Host port of the dev Mongo container (Docker dev only, default 27017) |
| `JWT_TOKEN_KEY` / `JWT_EXPIRES_IN` | JWT signing secret and lifetime |
| `DATABASE_LINK` / `DATABASE_NAME` | Mongo connection string and DB name |
| `MAILGUN_DOMAIN` / `MAILGUN_API_KEY` / `MAIL_FROM` | Outgoing email (OTP, password reset, notifications). Optional outside production: with no key, emails, including OTP codes, are written to the app log instead |
| `APP_NAME` / `SUPPORT_EMAIL` / `EMAIL_LOGO_URL` | Branding used in email templates |

Never commit `.env`. `.gitignore` already excludes it.

## Project layout

```
src/
  main.ts                  # bootstrap: CORS, compression, morgan, ValidationPipe, TransformInterceptor, Swagger
  config.ts                # typed env config (dotenv)
  commons/
    constants/             # messages, regexes (PASSWORD_REGEX), status constants
    schemas/abstract.schema.ts   # Base class + BaseSchema (createdAt/updatedAt)
  interceptors/            # auth, admin, self-or-admin, mongo-id validation, response transform, morgan
  services/
    abstract_quries.service.ts   # findAll(): shared pagination + regex search helper
    mailgun.service.ts           # EmailService
    customLogger.ts / winston.logger.ts   # Winston with daily rotating files in logs/
  utils/email-templates.ts # HTML email templates: { SUBJECT, HTML }
  modules/
    app/                   # AppModule, routes.ts (RouterModule prefixes), /ping
    auth/  user/  access-control/  notification/  example/
```

Every feature module follows the same shape:

```
modules/<name>/
  <name>.module.ts
  index.ts                 # export * from './<name>.module'
  controllers/  <name>.controller.ts + index.ts
  services/     <name>.service.ts    + index.ts
  schemas/      <name>.schema.ts     + index.ts
  dto/          *.dto.ts             + index.ts
```

## Landing page

`GET /` serves the HTML from `src/modules/app/landing-page.ts`, sent with `@Res()` so the JSON `TransformInterceptor` doesn't wrap it. It's excluded from Swagger. The endpoint list on the page is a hand-written `ENDPOINT_GROUPS` array, so **update it when you add or rename routes**. The "API docs" button only appears when `NODE_ENV !== 'production'`. App name comes from `APP_NAME` and the version from `package.json`.

## Routing

Route prefixes are set in `src/modules/app/routes.ts` via `RouterModule`, not in `@Controller()`. Controllers use `@Controller()` (or a sub-path) and inherit the prefix.

| Prefix | Module |
|--------|--------|
| `/auth` | AuthModule |
| `/user` | UserModule |
| `/notification` | NotificationModule |
| `/` | AccessControlModule (its controller is `admin/access-control`) |
| `/example` | ExampleModule |

In controllers with `:id` routes, static routes such as `settings` must be declared **before** `@Get(':id')`, or Nest matches them as an id.

## Auth and authorization

There are no Passport guards. Auth uses **interceptors**, applied per route or per controller with `@UseInterceptors(...)`:

| Interceptor | Effect |
|-------------|--------|
| `DecryptTokenInterceptor` (`interceptors/auth.interceptor.ts`) | Verifies `Authorization: Bearer <jwt>` with `JWT_TOKEN_KEY` and sets `req.user = { id, email, name, role }`. Throws 401 otherwise |
| `AdminInterceptor` | Requires `req.user.role === 'admin'`. Must come **after** `DecryptTokenInterceptor` |
| `SelfOrAdminInterceptor` | Allows access when `req.params.id === req.user.id`, or for admins |
| `MongoIdValidationInterceptor` | Returns 400 when `req.params.id` is not a 24-hex ObjectId |

Order matters: `@UseInterceptors(DecryptTokenInterceptor, AdminInterceptor)`.

User model notes (`modules/user/schemas/user.schema.ts`):
- `role` is a string (`UserRole.USER` / `UserRole.ADMIN`). `roleId` optionally references an RBAC `Role`.
- Passwords are hashed by a **pre-save hook** (bcrypt, 10 rounds). Assign the plain password and call `save()`/`create()`. **Do not hash manually**, or it gets hashed twice and login breaks. `findByIdAndUpdate` skips the hook, so never set `password` through it.
- Check passwords with `user.validatePassword(plain)`.
- Field names are snake_case (`first_name`, `full_name`). DTOs are camelCase and services map between them.

First admin: `POST /auth/seed-admin` works only while no admin exists. Users must verify their email (OTP) before they can log in. Seeded and admin-created users are verified automatically.

## Response format

`TransformInterceptor` is global and wraps every response:

```json
{ "timestamp": "...", "success": true, "data": <handler return value>, "error": { "message": [] } }
```

Errors use the same envelope with `success: false` and `error.message`. By convention, throw Nest exceptions with an **array** of messages: `throw new BadRequestException(['User not found'])`.

## Validation

The global `ValidationPipe` uses `{ transform: true, whitelist: true }`. Properties without class-validator decorators are **stripped** from request bodies. Every DTO field needs a decorator such as `@IsOptional()` and `@ApiProperty()` for Swagger. Query DTOs need `@Type(() => Number)` for numeric params.

## Database conventions

- Schemas extend `Base` and call `XSchema.add(BaseSchema)` to get `createdAt`/`updatedAt`. `updatedAt` refreshes automatically only on `findOneAndUpdate`.
- Register models in the module that uses them via `MongooseModule.forFeature`. Several modules register `User` this way. That is intentional, so modules don't import each other only to get a model.
- Use `findAll(model, limit, search, page, searchFields, filter, projection, populate, sort?)` from `src/services` for paginated lists. It returns `{ results, totalDocuments, currentPage, totalPages, limit }`.

## Email

`EmailService.sendEmailNotification({ to, subject, html })` (Mailgun). Templates live in `src/utils/email-templates.ts`. Each one returns `{ SUBJECT, HTML }` and is built from the shared `layout()`, `otpBlock()`, `detailCard()` and `signOff()` helpers. Add new templates there. Any module that sends email must list `EmailService` in its `providers`.

## Notifications

`POST /notification` creates a notification for every user with the given `role`. `type: 'email'` also emails those users (respecting `emailNotifications`). Any other type is in-app only. For notifications triggered by code, call `NotificationService.createInApp({ users, type, title, description, action }, createdById)` after importing `NotificationModule`. Read state is tracked per user in `readStatuses`.

Push notifications (FCM) are not implemented. `User.fcmTokens` is stored at login, so a push sender can be added to `NotificationService`.

## Adding a module

1. Copy `src/modules/example` to `src/modules/<name>` and rename the classes and files.
2. Add the module to `imports` in `app.module.ts` and add a `{ path: '/<name>', module: XModule }` entry in `routes.ts`.
3. Protect routes with the interceptors above.
4. Add `@ApiTags`, `@ApiBearerAuth` and `@ApiOperation` so the routes show up in Swagger.
5. Run `npm run lint && npm run build`.

## Logging

- Nest logger → Winston (`CustomLogger`) → console + `logs/application-YYYY-MM-DD.log` (kept 14 days)
- HTTP access log → `logs/access.log` (morgan, combined format)

`logs/` is created at startup and git-ignored.

## Docker setup

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage build on `node:26-alpine` (Active LTS; the floating tag + `apk upgrade` pick up Node and Alpine security patches on every rebuild, so rebuild regularly). Target `dev`: full deps, `npm run start:dev`. Target `runner`: production deps + `dist/` only, runs as non-root `node`, `node dist/main` |
| `docker-compose.yml` | Production. Service `app` (target `runner`), `env_file: .env`, publishes `${PORT}`, healthcheck on `GET /ping`, logs in the `app_logs` volume, joins the external `main_network` |
| `docker-compose.dev.yml` | Dev override. Builds target `dev`, bind-mounts `src/` and the tsconfig/nest-cli files for hot reload, forces `DATABASE_LINK=mongodb://mongo:27017`, adds a `mongo:7` service (data in the `mongo_data` volume, exposed on `127.0.0.1:${MONGO_PORT}`) |
| `setup.sh` | Checks `.env`, creates `main_network` if it's missing, builds, then runs `up -d --wait` and fails if the app never becomes healthy |

`setup.sh` checks before it builds:
- Always: `PORT` (numeric), `JWT_TOKEN_KEY`, `JWT_EXPIRES_IN`, `DATABASE_NAME`.
- Production also needs `DATABASE_LINK`, `MAILGUN_DOMAIN`, `MAILGUN_API_KEY` and `MAIL_FROM`, plus `NODE_ENV=production`, a `JWT_TOKEN_KEY` of 32+ chars (`openssl rand -hex 32`), and a `DATABASE_LINK` that isn't localhost (inside a container, localhost is the container itself).

Notes:
- Mongo has no migrations, so there is no migrate step. Schemas are applied by Mongoose at runtime.
- Dev hot reload covers `src/` only. After changing `package.json`, rerun `bash setup.sh --dev` to rebuild the image.
- Don't bind-mount `dist/`. `nest build` deletes it, which fails on a mount point (EBUSY).
- `.env` is never copied into the image (`.dockerignore`). Config reaches the container through `env_file`.
- Other stacks on `main_network` (e.g. a reverse proxy) can reach the app at `app:${PORT}`.

## Node version policy

Always use the current Node **Active LTS** with the latest patches. Check with `curl -s https://nodejs.org/dist/index.json` (the newest entry with `lts` set). When a new LTS lands, bump `ARG NODE_IMAGE` in the `Dockerfile`, `.nvmrc`, `engines.node` and `@types/node` together, then run `npm audit --omit=dev`.

## Deployment

On the server: clone the repo, create `.env` (`NODE_ENV=production`, real secrets, a reachable `DATABASE_LINK` such as Atlas), then run `bash setup.sh`. To redeploy, `git pull && bash setup.sh`. The old container keeps serving while the new image builds.
