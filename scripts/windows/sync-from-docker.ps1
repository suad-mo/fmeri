param(
    [string]$DockerContainer = "nx-fmeri-db",
    [string]$DockerUri = "mongodb://suad_krvavac:Suad150014!@localhost:27017/nx-fmeri?authSource=admin",
    [string]$LocalUri = "mongodb://localhost:27017/nx-fmeri"
)

$ErrorActionPreference = "Stop"
$env:PATH += ";C:\Program Files\MongoDB\Tools\100\bin"
$BACKUP_DIR = ".\backup\sync-from-docker-temp"

Write-Host "nx-fmeri - Sync Docker to Local" -ForegroundColor Cyan
Write-Host "-------------------------------------" -ForegroundColor Gray

# 1. Provjeri Docker
$running = docker ps --filter "name=$DockerContainer" -q
if (-not $running) {
    Write-Host "GRESKA: Docker container nije pokrenut!" -ForegroundColor Red
    exit 1
}
Write-Host "Docker container aktivan." -ForegroundColor Green

# 2. Dump Docker baze
Write-Host "Dumping Docker baze..." -ForegroundColor Cyan
if (Test-Path $BACKUP_DIR) { Remove-Item -Recurse -Force $BACKUP_DIR }
docker exec $DockerContainer mongodump --uri=$DockerUri --out=/backup-temp
docker cp "${DockerContainer}:/backup-temp/." $BACKUP_DIR
docker exec $DockerContainer rm -rf /backup-temp
if ($LASTEXITCODE -ne 0) { Write-Host "GRESKA: Dump nije uspio!" -ForegroundColor Red; exit 1 }
Write-Host "Dump zavrsen!" -ForegroundColor Green

# 3. Restore u lokalnu bazu
Write-Host "Restoring u lokalnu bazu..." -ForegroundColor Cyan
mongorestore --uri=$LocalUri --drop "$BACKUP_DIR\nx-fmeri"
if ($LASTEXITCODE -ne 0) { Write-Host "GRESKA: Restore nije uspio!" -ForegroundColor Red; exit 1 }
Write-Host "Restore zavrsen!" -ForegroundColor Green

# 4. Kopiraj uploads iz Docker u lokalno
Write-Host "Kopiranje uploads fajlova..." -ForegroundColor Cyan
$localUploads = ".\dist\apps\uploads"
$dockerUploads = ".\docker-data\uploads"
if (Test-Path $dockerUploads) {
    if (-not (Test-Path $localUploads)) {
        New-Item -ItemType Directory -Force -Path $localUploads | Out-Null
    }
    Copy-Item -Recurse -Force "$dockerUploads\*" "$localUploads\"
    Write-Host "Uploads kopirani!" -ForegroundColor Green
} else {
    Write-Host "Nema uploads fajlova." -ForegroundColor Yellow
}

# 5. Cleanup
Remove-Item -Recurse -Force $BACKUP_DIR
Write-Host ""
Write-Host "Sync zavrsen!" -ForegroundColor Green
Write-Host "-------------------------------------" -ForegroundColor Gray
Write-Host "Docker baza sinhronizovana s lokalnom bazom." -ForegroundColor White
Write-Host "-------------------------------------" -ForegroundColor Gray
