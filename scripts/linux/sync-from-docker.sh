#!/bin/bash
set -e

DOCKER_CONTAINER="${1:-nx-fmeri-db}"
DOCKER_URI="${2:-mongodb://suad_krvavac:Suad150014!@localhost:27017/nx-fmeri?authSource=admin}"
LOCAL_URI="${3:-mongodb://localhost:27017/nx-fmeri}"
BACKUP_DIR="./backup/sync-from-docker-temp"

echo "================================================"
echo " nx-fmeri - Sync Docker to Local"
echo "================================================"

# 1. Provjeri Docker
if ! docker ps --filter "name=$DOCKER_CONTAINER" -q | grep -q .; then
    echo "GRESKA: Docker container nije pokrenut!"
    exit 1
fi
echo "Docker container aktivan."

# 2. Dump Docker baze
echo "Dumping Docker baze..."
rm -rf "$BACKUP_DIR"
docker exec $DOCKER_CONTAINER mongodump --uri="$DOCKER_URI" --out=/backup-temp
docker cp "${DOCKER_CONTAINER}:/backup-temp/." "$BACKUP_DIR"
docker exec $DOCKER_CONTAINER rm -rf /backup-temp
echo "Dump zavrsen!"

# 3. Restore u lokalnu bazu
echo "Restoring u lokalnu bazu..."
mongorestore --uri="$LOCAL_URI" --drop "$BACKUP_DIR/nx-fmeri"
echo "Restore zavrsen!"

# 4. Kopiraj uploads
echo "Kopiranje uploads fajlova..."
if [ -d "./docker-data/uploads" ]; then
    mkdir -p ./dist/apps/uploads
    cp -r ./docker-data/uploads/. ./dist/apps/uploads/
    echo "Uploads kopirani!"
else
    echo "Nema uploads fajlova."
fi

# 5. Cleanup
rm -rf "$BACKUP_DIR"

echo "================================================"
echo " Sync zavrsen!"
echo " Docker baza sinhronizovana s lokalnom bazom."
echo "================================================"
