# CLAUDE.md

Guidance for Claude Code sessions and new developers working in this repository.

## What this is

A **NestJS 10 + MongoDB (Mongoose 8)** backend boilerplate. It ships with:

- JWT auth: signup, login, email OTP verification, forgot/reset/change password, one-time admin seed
- Users: profile, settings, admin user management
- RBAC: roles and permissions (admin-only CRUD)
- Notifications: in-app notifications with read tracking, optional email fan-out
- An `example` module: a minimal CRUD module to copy when adding features

It is not tied to any business domain. Add domain features as new modules (see "Adding a module").

## Commands

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

Quick local Mongo: `docker run -d --name mongo -p 27017:27017 mongo:7`

## Environment

Copy `.env.example` to `.env`. All env access goes through `src/config.ts`. Add new variables there, not as scattered `process.env` reads.

| Variable | Purpose |
|----------|---------|
| `NODE_ENV` | `production` disables Swagger |
| `PORT` | HTTP port |
| `SERVICE_NAME` | Logger context name |
| `CORS_ORIGINS` | Comma-separated allowed origins |
| `JWT_TOKEN_KEY` / `JWT_EXPIRES_IN` | JWT signing secret and lifetime |
| `DATABASE_LINK` / `DATABASE_NAME` | Mongo connection string and DB name |
| `MAILGUN_DOMAIN` / `MAILGUN_API_KEY` / `MAIL_FROM` | Outgoing email (OTP, password reset, notifications) |
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

## Deployment

`Dockerfile` is a multi-stage build that runs `node dist/main` on port 4002. Pass env vars at runtime (`docker run --env-file .env ...`). Don't bake secrets into the image.
