#!/bin/bash
set -e

DOCKER_CONTAINER="${1:-nx-fmeri-db}"
DOCKER_URI="${2:-mongodb://suad_krvavac:Suad150014!@localhost:27017/nx-fmeri?authSource=admin}"
COMPRESS="${3:-false}"

DATUM=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_DIR="./backup/$DATUM"

echo "================================================"
echo " nx-fmeri - Backup Docker baze"
echo " Datum: $DATUM"
echo "================================================"

# 1. Provjeri Docker
if ! docker ps --filter "name=$DOCKER_CONTAINER" -q | grep -q .; then
    echo "GRESKA: Docker container nije pokrenut!"
    exit 1
fi
echo "Docker container aktivan."

# 2. Dump Docker baze
echo "Dumping Docker baze..."
mkdir -p "$BACKUP_DIR/db"
docker exec $DOCKER_CONTAINER mongodump --uri="$DOCKER_URI" --out=/backup-temp
docker cp "${DOCKER_CONTAINER}:/backup-temp/." "$BACKUP_DIR/db"
docker exec $DOCKER_CONTAINER rm -rf /backup-temp
echo "Dump zavrsen!"

# 3. Kopiraj uploads
echo "Kopiranje uploads fajlova..."
if [ -d "./docker-data/uploads" ]; then
    cp -r ./docker-data/uploads "$BACKUP_DIR/uploads"
    echo "Uploads kopirani!"
else
    echo "Nema uploads fajlova."
fi

# 4. Kompresuj (opcionalno)
if [ "$COMPRESS" = "true" ]; then
    echo "Kompresovanje backupa..."
    zip -r "./backup/nx-fmeri-backup-$DATUM.zip" "$BACKUP_DIR"
    rm -rf "$BACKUP_DIR"
    echo "Backup kompresovan: ./backup/nx-fmeri-backup-$DATUM.zip"
else
    echo "Backup spremen u: $BACKUP_DIR"
fi

# 5. Prikaži stare backupe
echo ""
echo "Postojeci backupi:"
ls -lh ./backup/ 2>/dev/null || echo "Nema backupa."

echo "================================================"
echo " Backup zavrsen!"
echo "================================================"
