#!/bin/bash
# Usage: bash setup.sh          # production (docker-compose.yml only, DB via DATABASE_LINK)
#        bash setup.sh --dev    # local dev (adds docker-compose.dev.yml: local MongoDB + hot reload)
set -euo pipefail
cd "$(dirname "$0")"

COMPOSE_FILES=(-f docker-compose.yml)
DEV=false
if [ "${1:-}" == "--dev" ]; then
  DEV=true
  COMPOSE_FILES+=(-f docker-compose.dev.yml)
fi

# Check if .env file exists
if [ ! -f .env ]; then
  echo "Copying .env.example to .env..."
  cp .env.example .env
  chmod 600 .env
  echo "Fill in .env, then run setup.sh again."
  exit 1
fi
chmod 600 .env

# docker compose reads .env itself — don't export secrets into the shell.
# `|| true`: a missing key must reach the "not set" check below, not silently abort via pipefail.
# tr strips \r (Windows line endings) and surrounding quotes.
env_value() { { grep -E "^$1=" .env || true; } | tail -1 | cut -d= -f2- | tr -d "\r\"'"; }

REQUIRED=(PORT JWT_TOKEN_KEY JWT_EXPIRES_IN DATABASE_NAME)
# Dev gets DATABASE_LINK from docker-compose.dev.yml; email is optional locally
if [ "$DEV" == false ]; then
  REQUIRED+=(DATABASE_LINK MAILGUN_DOMAIN MAILGUN_API_KEY MAIL_FROM)
fi

for var in "${REQUIRED[@]}"; do
  if [ -z "$(env_value "$var")" ]; then
    echo "$var is not set in .env. Exiting..."
    exit 1
  fi
done
# An empty PORT would make Docker publish the app on a random host port
if ! [[ "$(env_value PORT)" =~ ^[0-9]+$ ]]; then
  echo "PORT must be a port number. Exiting..."
  exit 1
fi

if [ "$DEV" == true ]; then
  if [ -z "$(env_value MAILGUN_API_KEY)" ]; then
    echo "Note: MAILGUN_API_KEY is empty — emails (incl. OTP codes) are written to the app log instead of sent."
  fi
else
  # Production must not run with dev settings (NODE_ENV != production serves Swagger at /api)
  if [ "$(env_value NODE_ENV)" != "production" ]; then
    echo "Refusing production setup: .env needs NODE_ENV=production."
    echo "Fix .env, or run 'bash setup.sh --dev' for local development."
    exit 1
  fi
  JWT_TOKEN_KEY="$(env_value JWT_TOKEN_KEY)"
  if [ "${#JWT_TOKEN_KEY}" -lt 32 ] || [ "$JWT_TOKEN_KEY" == "change-me" ]; then
    echo "JWT_TOKEN_KEY must be at least 32 characters in production. Exiting..."
    echo "Generate one with: openssl rand -hex 32"
    exit 1
  fi
  if [[ "$(env_value DATABASE_LINK)" =~ (localhost|127\.0\.0\.1) ]]; then
    echo "DATABASE_LINK points at localhost, which is the container itself in Docker. Exiting..."
    exit 1
  fi
fi

# Ensure the shared network exists (compose declares it external)
docker network inspect main_network >/dev/null 2>&1 || docker network create main_network

# Build first, while the old container keeps serving, so downtime is only the restart
docker compose "${COMPOSE_FILES[@]}" build

# Recreate the containers and wait for their healthchecks; fails the script if they never get healthy
if ! docker compose "${COMPOSE_FILES[@]}" up -d --wait --remove-orphans; then
  echo "App did not become healthy. Check: docker compose ${COMPOSE_FILES[*]} logs app"
  exit 1
fi

echo "App is up on http://localhost:$(env_value PORT)"
if [ "$DEV" == true ]; then
  echo "Swagger: http://localhost:$(env_value PORT)/api"
fi
