#!/bin/bash
set -e

SKIP_BUILD=false
SEED=false

for arg in "$@"; do
    case $arg in
        --skip-build) SKIP_BUILD=true ;;
        --seed) SEED=true ;;
    esac
done

echo "================================================"
echo " nx-fmeri - Deployment"
echo "================================================"

# Provjeri .env.production
if [ ! -f ".env.production" ]; then
    echo "GRESKA: .env.production nije pronađen!"
    exit 1
fi

# Provjeri Docker
if ! docker info > /dev/null 2>&1; then
    echo "GRESKA: Docker nije pokrenut!"
    exit 1
fi

# Build
if [ "$SKIP_BUILD" = false ]; then
    echo "Buildanje Docker imagea..."

    # Obriši stare image-e
    echo "Brisanje starih image-a..."
    docker image rm nx-fmeri-api nx-fmeri-web 2>/dev/null || true

    docker compose --env-file .env.production build --no-cache
    echo "Build zavrsen!"
fi

# Zaustavi kontejnere
echo "Zaustavljanje kontejnera..."
docker compose --env-file .env.production down

# Pokreni kontejnere
echo "Pokretanje kontejnera..."
docker compose --env-file .env.production up -d

# Seed
if [ "$SEED" = true ]; then
    echo "Pokretanje seedova..."
    sleep 8
    docker compose --env-file .env.production exec api node dist/apps/api-server/src/seeds/seed-all-new.js
fi

sleep 3
echo ""
echo "Status kontejnera:"
docker compose --env-file .env.production ps
echo ""
echo "================================================"
echo " Deployment zavrsen!"
echo " Web: http://localhost"
echo " API: http://localhost:3000"
echo "================================================"
