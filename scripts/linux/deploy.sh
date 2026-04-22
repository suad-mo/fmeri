#!/bin/bash
set -e

echo "🚀 Deploying nx-fmeri..."

echo "⏹ Zaustavljam kontejnere..."
docker compose --env-file .env.production down

echo "🔨 Buildanje image-a..."
docker compose --env-file .env.production build --no-cache

echo "▶ Pokretanje kontejnera..."
docker compose --env-file .env.production up -d

sleep 5
echo "📊 Status kontejnera:"
docker compose ps

echo "✅ Deploy završen!"
echo "   Frontend: http://localhost"
echo "   API:      http://localhost:3000"
