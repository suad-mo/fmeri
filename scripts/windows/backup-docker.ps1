param(
    [string]$DockerContainer = "nx-fmeri-db",
    [string]$DockerUri = "mongodb://suad_krvavac:Suad150014!@localhost:27017/nx-fmeri?authSource=admin",
    [switch]$Compress
)

$ErrorActionPreference = "Stop"
$env:PATH += ";C:\Program Files\MongoDB\Tools\100\bin"

$datum = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$BACKUP_DIR = ".\backup\$datum"

Write-Host "nx-fmeri - Backup Docker baze" -ForegroundColor Cyan
Write-Host "-------------------------------------" -ForegroundColor Gray
Write-Host "Datum: $datum" -ForegroundColor Gray

# 1. Provjeri Docker
$running = docker ps --filter "name=$DockerContainer" -q
if (-not $running) {
    Write-Host "GRESKA: Docker container nije pokrenut!" -ForegroundColor Red
    exit 1
}

# 2. Dump Docker baze
Write-Host "Dumping Docker baze..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path $BACKUP_DIR | Out-Null
docker exec $DockerContainer mongodump --uri=$DockerUri --out=/backup-temp
if ($LASTEXITCODE -ne 0) { Write-Host "GRESKA: mongodump nije uspio!" -ForegroundColor Red; exit 1 }

# 3. Kopiraj dump na lokalni disk
Write-Host "Kopiranje backupa..." -ForegroundColor Cyan
docker cp "${DockerContainer}:/backup-temp/." "$BACKUP_DIR\db"
docker exec $DockerContainer rm -rf /backup-temp

# 4. Kopiraj uploads
Write-Host "Kopiranje uploads fajlova..." -ForegroundColor Cyan
$uploadsDir = ".\docker-data\uploads"
if (Test-Path $uploadsDir) {
    Copy-Item -Recurse -Force $uploadsDir "$BACKUP_DIR\uploads"
    Write-Host "Uploads kopirani!" -ForegroundColor Green
}

# 5. Kompresuj (opcionalno)
if ($Compress) {
    Write-Host "Kompresovanje backupa..." -ForegroundColor Cyan
    $zipPath = ".\backup\nx-fmeri-backup-$datum.zip"
    Compress-Archive -Path $BACKUP_DIR -DestinationPath $zipPath
    Remove-Item -Recurse -Force $BACKUP_DIR
    Write-Host "Backup kompresovan: $zipPath" -ForegroundColor Green
} else {
    Write-Host "Backup spremen u: $BACKUP_DIR" -ForegroundColor Green
}

# 6. Prikaži stare backupe
Write-Host ""
Write-Host "Postojeci backupi:" -ForegroundColor Cyan
Get-ChildItem ".\backup" | Sort-Object LastWriteTime -Descending | 
    Select-Object Name, LastWriteTime, @{N="Velicina";E={
        if ($_.PSIsContainer) { 
            "{0:N2} MB" -f ((Get-ChildItem $_.FullName -Recurse | Measure-Object Length -Sum).Sum / 1MB)
        } else {
            "{0:N2} MB" -f ($_.Length / 1MB)
        }
    }} | Format-Table -AutoSize

Write-Host "Backup zavrsen!" -ForegroundColor Green
Write-Host "-------------------------------------" -ForegroundColor Gray
