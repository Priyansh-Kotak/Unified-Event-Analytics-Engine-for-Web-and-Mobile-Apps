#!/bin/bash

# Database backup script
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/analytics_backup_$TIMESTAMP.sql"

# Create backup directory
mkdir -p $BACKUP_DIR

echo "📦 Creating database backup..."

# Load environment variables
if [ -f .env.production ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
fi

# Create backup
docker exec analytics_postgres pg_dump -U $DB_USER $DB_NAME > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

echo "✅ Backup created: ${BACKUP_FILE}.gz"

# Keep only last 7 backups
ls -t $BACKUP_DIR/*.gz | tail -n +8 | xargs -r rm

echo "🧹 Old backups cleaned up"