param(
    [string]$LocalUri = "mongodb://localhost:27017/nx-fmeri",
    [string]$DockerContainer = "nx-fmeri-db",
    [string]$ApiContainer = "nx-fmeri-api",
    [string]$DockerUri = "mongodb://suad_krvavac:Suad150014!@localhost:27017/nx-fmeri?authSource=admin"
)

$ErrorActionPreference = "Stop"
$env:PATH += ";C:\Program Files\MongoDB\Tools\100\bin"
$BACKUP_DIR = ".\backup\nx-fmeri-sync"

Write-Host "nx-fmeri - Sync Local to Docker" -ForegroundColor Cyan
Write-Host "-------------------------------------" -ForegroundColor Gray

$running = docker ps --filter "name=$DockerContainer" -q
if (-not $running) {
    Write-Host "GRESKA: Docker container nije pokrenut!" -ForegroundColor Red
    exit 1
}
Write-Host "Docker container aktivan." -ForegroundColor Green

# 1. Dump lokalne baze
Write-Host "Dumping lokalne baze..." -ForegroundColor Cyan
if (Test-Path $BACKUP_DIR) { Remove-Item -Recurse -Force $BACKUP_DIR }
mongodump --uri=$LocalUri --out=$BACKUP_DIR
if ($LASTEXITCODE -ne 0) { Write-Host "GRESKA: mongodump nije uspio!" -ForegroundColor Red; exit 1 }
Write-Host "Dump zavrsen!" -ForegroundColor Green

# 2. Kopiraj dump u Docker container
Write-Host "Kopiranje baze u Docker container..." -ForegroundColor Cyan
docker cp "$BACKUP_DIR\." "${DockerContainer}:/backup"
if ($LASTEXITCODE -ne 0) { Write-Host "GRESKA: Kopiranje nije uspjelo!" -ForegroundColor Red; exit 1 }
Write-Host "Kopirano!" -ForegroundColor Green

# 3. Restore u Docker bazu
Write-Host "Restoring u Docker bazu..." -ForegroundColor Cyan
docker exec $DockerContainer mongorestore --uri=$DockerUri --drop /backup/nx-fmeri
if ($LASTEXITCODE -ne 0) { Write-Host "GRESKA: mongorestore nije uspio!" -ForegroundColor Red; exit 1 }
Write-Host "Restore zavrsen!" -ForegroundColor Green

# 4. Kopiraj uploads fajlove
Write-Host "Kopiranje uploads fajlova..." -ForegroundColor Cyan
$uploadsDir = ".\dist\apps\uploads"
$dockerUploadsDir = ".\docker-data\uploads"

if (Test-Path $uploadsDir) {
    # Kreiraj docker-data/uploads ako ne postoji
    if (-not (Test-Path $dockerUploadsDir)) {
        New-Item -ItemType Directory -Force -Path $dockerUploadsDir | Out-Null
    }
    # Kopiraj sve fajlove
    Copy-Item -Recurse -Force "$uploadsDir\*" "$dockerUploadsDir\"
    Write-Host "Uploads kopirani!" -ForegroundColor Green
} else {
    Write-Host "Nema lokalnih uploads fajlova — preskacemo." -ForegroundColor Yellow
}

# 5. Cleanup
Remove-Item -Recurse -Force $BACKUP_DIR
Write-Host ""
Write-Host "Sync zavrsen!" -ForegroundColor Green
Write-Host "-------------------------------------" -ForegroundColor Gray
Write-Host "Lokalna baza i fajlovi sinhronizovani s Dockerom." -ForegroundColor White
Write-Host "-------------------------------------" -ForegroundColor Gray
