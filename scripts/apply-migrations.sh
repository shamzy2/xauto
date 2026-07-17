#!/usr/bin/env bash
# Usage: DATABASE_URL='postgresql://...' ./scripts/apply-migrations.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export PATH="/opt/homebrew/opt/libpq/bin:$PATH"
if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "Set DATABASE_URL to the new Supabase Postgres URI (Settings → Database → URI)"
  exit 1
fi
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$ROOT/scripts/apply-all-migrations.sql"
echo "Migrations applied."
