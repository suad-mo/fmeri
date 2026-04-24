#!/bin/bash
set -e

LOCAL_URI="${1:-mongodb://localhost:27017/nx-fmeri}"
DOCKER_CONTAINER="${2:-nx-fmeri-db}"
DOCKER_URI="${3:-mongodb://suad_krvavac:Suad150014!@localhost:27017/nx-fmeri?authSource=admin}"
BACKUP_DIR="./backup/sync-to-docker-temp"

echo "================================================"
echo " nx-fmeri - Sync Local to Docker"
echo "================================================"

# 1. Provjeri Docker
if ! docker ps --filter "name=$DOCKER_CONTAINER" -q | grep -q .; then
    echo "GRESKA: Docker container nije pokrenut!"
    exit 1
fi
echo "Docker container aktivan."

# 2. Dump lokalne baze
echo "Dumping lokalne baze..."
rm -rf "$BACKUP_DIR"
mongodump --uri="$LOCAL_URI" --out="$BACKUP_DIR"
echo "Dump zavrsen!"

# 3. Kopiraj dump u Docker container
echo "Kopiranje u Docker container..."
docker cp "$BACKUP_DIR/." "${DOCKER_CONTAINER}:/backup"
echo "Kopirano!"

# 4. Restore u Docker bazu
echo "Restoring u Docker bazu..."
docker exec $DOCKER_CONTAINER mongorestore --uri="$DOCKER_URI" --drop /backup/nx-fmeri
echo "Restore zavrsen!"

# 5. Kopiraj uploads
echo "Kopiranje uploads fajlova..."
if [ -d "./dist/apps/uploads" ]; then
    mkdir -p ./docker-data/uploads
    cp -r ./dist/apps/uploads/. ./docker-data/uploads/
    echo "Uploads kopirani!"
else
    echo "Nema uploads fajlova."
fi

# 6. Cleanup
rm -rf "$BACKUP_DIR"

echo "================================================"
echo " Sync zavrsen!"
echo " Lokalna baza sinhronizovana s Dockerom."
echo "================================================"
