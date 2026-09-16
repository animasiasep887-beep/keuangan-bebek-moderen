# ==============================================================================
# BebekJaya PRO - Windows Deployment Script (PowerShell)
# Alur: Backup DB -> Git Pull -> Restore Live DB -> npm install -> Build -> PM2 Restart
# ==============================================================================

$ErrorActionPreference = "Stop"

Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "   🦆 BEBEKJAYA PRO - AUTO DEPLOYMENT KE VPS RDP         " -ForegroundColor Yellow
Write-Host "=========================================================" -ForegroundColor Cyan

# 1. Tentukan direktori kerja proyek (bisa via env APP_DIR atau folder script)
if ($env:APP_DIR -and (Test-Path $env:APP_DIR)) {
    $PROJECT_DIR = $env:APP_DIR
} else {
    $PROJECT_DIR = Split-Path -Parent $PSScriptRoot
}
Set-Location $PROJECT_DIR
Write-Host "[1/6] Direktori kerja: $PROJECT_DIR" -ForegroundColor Green

# 2. Backup Database dan .env sebelum update
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"
$BACKUP_DIR = Join-Path $PROJECT_DIR "server\data\backups"
if (-not (Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR -Force | Out-Null
}

$DB_FILE = Join-Path $PROJECT_DIR "server\data\farm_database.json"
$TEMP_DB_BACKUP = Join-Path $BACKUP_DIR "live_db_before_deploy.json"
$ENV_FILE = Join-Path $PROJECT_DIR ".env"
$TEMP_ENV_BACKUP = Join-Path $BACKUP_DIR "live_env_before_deploy.tmp"

if (Test-Path $DB_FILE) {
    Copy-Item $DB_FILE (Join-Path $BACKUP_DIR "farm_db_backup_$TIMESTAMP.json") -Force
    Copy-Item $DB_FILE $TEMP_DB_BACKUP -Force
    Write-Host "[2/6] Database riil berhasil dibackup ke backups/farm_db_backup_$TIMESTAMP.json" -ForegroundColor Green
} else {
    Write-Host "[2/6] Database belum ada, akan diinisialisasi baru." -ForegroundColor Yellow
}

if (Test-Path $ENV_FILE) {
    Copy-Item $ENV_FILE $TEMP_ENV_BACKUP -Force
}

# 3. Ambil kode terbaru dari GitHub
Write-Host "[3/6] Menarik pembaruan kode dari GitHub (origin/main)..." -ForegroundColor Cyan
try {
    # Stash perubahan lokal jika ada agar git pull lancar
    git stash | Out-Null
    git fetch origin main
    git reset --hard origin/main
    Write-Host "      Kode berhasil diperbarui ke commit terbaru!" -ForegroundColor Green
} catch {
    Write-Host "      Peringatan saat git pull: $_" -ForegroundColor Yellow
}

# 4. Kembalikan file database dan .env riil VPS agar data transaksi dan konfigurasi tidak hilang
if (Test-Path $TEMP_DB_BACKUP) {
    Copy-Item $TEMP_DB_BACKUP $DB_FILE -Force
    Remove-Item $TEMP_DB_BACKUP -Force
    Write-Host "[4/6] Database riil VPS berhasil dipertahankan (data aman)." -ForegroundColor Green
}

if (Test-Path $TEMP_ENV_BACKUP) {
    Copy-Item $TEMP_ENV_BACKUP $ENV_FILE -Force
    Remove-Item $TEMP_ENV_BACKUP -Force
    Write-Host "      Konfigurasi produksi .env VPS berhasil dipertahankan." -ForegroundColor Green
}

# 5. Install dependensi & Build Frontend
Write-Host "[5/6] Memeriksa dependensi & build web application..." -ForegroundColor Cyan
npm install --no-audit --no-fund
npm run build
Write-Host "      Build selesai!" -ForegroundColor Green

# 6. Restart Server via PM2 atau Node
Write-Host "[6/6] Memulai ulang proses server..." -ForegroundColor Cyan

$pm2Exists = Get-Command pm2 -ErrorAction SilentlyContinue

if ($pm2Exists) {
    # Cek apakah service bebekjaya sudah terdaftar di PM2
    $pm2List = pm2 jlist | ConvertFrom-Json
    $appRunning = $pm2List | Where-Object { $_.name -eq "bebekjaya" }

    if ($appRunning) {
        Write-Host "      Me-restart service bebekjaya di PM2..." -ForegroundColor Green
        pm2 restart bebekjaya
    } else {
        Write-Host "      Mendaftarkan service bebekjaya ke PM2..." -ForegroundColor Green
        pm2 start server/server.js --name "bebekjaya"
        pm2 save
    }
} else {
    Write-Host "      [INFO] PM2 belum terpasang secara global. Disarankan pasang PM2 (npm i -g pm2)." -ForegroundColor Yellow
    Write-Host "      Aplikasi dapat dijalankan manual dengan: npm start" -ForegroundColor Yellow
}

Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "   ✅ DEPLOYMENT SELESAI! APLIKASI SUDAH TERBARU         " -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Cyan
