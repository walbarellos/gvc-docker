#!/usr/bin/env bash
# Backup do banco GVC — pg_dump com retenção rotativa e teste de restauração.
# Uso: ./backup/pg_backup.sh [--no-test]   (cron: 0 2 * * * /caminho/backup/pg_backup.sh >> /caminho/backup/backup.log 2>&1)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-$PROJECT_DIR/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
DB_CONTAINER="${DB_CONTAINER:-gvc-db}"
WITH_TEST=1
if [[ "${1:-}" == "--no-test" ]]; then WITH_TEST=0; fi

if [[ ! -f "$PROJECT_DIR/.env" ]]; then
  echo "[backup] ERRO: $PROJECT_DIR/.env não encontrado" >&2
  exit 1
fi
# shellcheck disable=SC1091
set -a; source "$PROJECT_DIR/.env"; set +a
: "${DB_USER:?DB_USER ausente no .env}"
: "${DB_NAME:?DB_NAME ausente no .env}"

mkdir -p "$BACKUP_DIR"
STAMP="$(date +%Y%m%d_%H%M%S)"
FILE="$BACKUP_DIR/gvc_${STAMP}.sql.gz"
LATEST="$BACKUP_DIR/gvc_latest.sql.gz"

if ! docker ps --format '{{.Names}}' | grep -qx "$DB_CONTAINER"; then
  echo "[backup] ERRO: container $DB_CONTAINER não está rodando" >&2
  exit 1
fi

echo "[backup] Iniciando dump em $FILE"
if ! docker exec "$DB_CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" -Fc | gzip > "$FILE"; then
  echo "[backup] ERRO: pg_dump falhou" >&2
  rm -f "$FILE"
  exit 1
fi
cp "$FILE" "$LATEST"

# Teste de integridade (lista o conteúdo do dump sem restaurar)
if [[ "$WITH_TEST" -eq 1 ]]; then
  if ! gzip -t "$FILE"; then
    echo "[backup] ERRO: dump corrompido (gzip -t)" >&2
    exit 1
  fi
  if ! gzip -dc "$FILE" | docker exec -i "$DB_CONTAINER" pg_restore --list > /dev/null 2>&1; then
    echo "[backup] ERRO: dump ilegível (pg_restore --list)" >&2
    exit 1
  fi
fi

# Retenção rotativa
find "$BACKUP_DIR" -name 'gvc_*.sql.gz' -mtime "+$RETENTION_DAYS" -delete

SIZE="$(du -h "$FILE" | cut -f1)"
echo "[backup] OK: $FILE ($SIZE), retenção de $RETENTION_DAYS dias em $BACKUP_DIR"