# ─── NX-FMERI - DEPLOY SCRIPT (Windows) ─────────────────────────────────────
# Korištenje: .\scripts\deploy.ps1
# Opcije:     .\scripts\deploy.ps1 -SkipBuild   (samo down + up)
#             .\scripts\deploy.ps1 -Seed         (pokreni seed nakon deploya)
param(
    [switch]$SkipBuild,
    [switch]$Seed
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 nx-fmeri — Deployment" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────" -ForegroundColor Gray

# 1. Provjeri .env.production
if (-not (Test-Path ".env.production")) {
    Write-Host "❌ .env.production nije pronađen!" -ForegroundColor Red
    exit 1
}

# 2. Provjeri Docker
# $dockerInfo = docker info 2>&1
# if ($LASTEXITCODE -ne 0 -and $dockerInfo -notmatch "WARNING") {
#     Write-Host "GRESKA: Docker nije pokrenut!" -ForegroundColor Red
#     exit 1
# }

try {
    docker info | Out-Null
} catch {
    Write-Host "GRESKA: Docker nije pokrenut!" -ForegroundColor Red
    exit 1
}

# 3. Build (ako nije skipan)
if (-not $SkipBuild) {
    Write-Host "🔨 Buildanje Docker imagea..." -ForegroundColor Cyan
    docker compose --env-file .env.production build --no-cache
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build nije uspio!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Build završen!" -ForegroundColor Green
}

# 4. Zaustavi kontejnere
Write-Host "⏹️  Zaustavljanje kontejnera..." -ForegroundColor Cyan
docker compose --env-file .env.production down

# 5. Pokreni kontejnere
Write-Host "📦 Pokretanje kontejnera..." -ForegroundColor Cyan
docker compose --env-file .env.production up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Greška pri pokretanju!" -ForegroundColor Red
    exit 1
}

# 6. Seed (opcionalno)
if ($Seed) {
    Write-Host "🌱 Pokretanje seedova..." -ForegroundColor Cyan
    Start-Sleep -Seconds 8
    docker compose --env-file .env.production exec api node dist/apps/api-server/src/seeds/seed-all-new.js
}

# 7. Status
Start-Sleep -Seconds 3
Write-Host ""
Write-Host "📊 Status kontejnera:" -ForegroundColor Cyan
docker compose --env-file .env.production ps
Write-Host ""
Write-Host "✅ Deployment završen!" -ForegroundColor Green
Write-Host "─────────────────────────────────────" -ForegroundColor Gray
Write-Host "🌐 Web:  http://localhost" -ForegroundColor White
Write-Host "🔌 API:  http://localhost:3000" -ForegroundColor White
Write-Host "─────────────────────────────────────" -ForegroundColor Gray