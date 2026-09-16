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

# 6. Menyiapkan Cloudflare Tunnel & Restart Server via PM2
Write-Host "[6/6] Menyiapkan Cloudflare Tunnel & Memulai ulang proses server..." -ForegroundColor Cyan

# Hapus caddy-proxy lama jika pernah ada di PM2
try {
    pm2 delete caddy-proxy 2>$null | Out-Null
} catch {}

# Pastikan cloudflared.exe tersedia di folder
$CLOUDFLARED_EXE = Join-Path $PROJECT_DIR "cloudflared.exe"
$TUNNEL_JSON = Join-Path $PROJECT_DIR "tunnel.json"

if (-not (Test-Path $CLOUDFLARED_EXE)) {
    Write-Host "      Mencari binary Cloudflare Tunnel di sistem..." -ForegroundColor Yellow
    $searchLocations = @(
        (Split-Path -Parent $PROJECT_DIR),
        "C:\Users\admin\Downloads",
        "C:\Users\admin",
        "C:\Users\USER\Downloads"
    )
    $found = $false
    foreach ($loc in $searchLocations) {
        if (Test-Path $loc) {
            $foundCf = Get-ChildItem -Path $loc -Filter "cloudflared.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
            if ($foundCf) {
                Copy-Item $foundCf.FullName $CLOUDFLARED_EXE -Force
                Write-Host "      Cloudflare Tunnel disalin dari: $($foundCf.FullName)" -ForegroundColor Green
                $found = $true
                break
            }
        }
    }

    if (-not $found) {
        Write-Host "      Mengunduh Cloudflare Tunnel binary resmi..." -ForegroundColor Yellow
        $curlExists = Get-Command curl.exe -ErrorAction SilentlyContinue
        if ($curlExists) {
            & curl.exe -sL -o $CLOUDFLARED_EXE "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
        } else {
            [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
            $ProgressPreference = 'SilentlyContinue'
            Invoke-WebRequest -Uri "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe" -OutFile $CLOUDFLARED_EXE -UseBasicParsing
        }
        Write-Host "      Cloudflare Tunnel binary berhasil disiapkan!" -ForegroundColor Green
    }
}

$pm2Exists = Get-Command pm2 -ErrorAction SilentlyContinue

if (-not $pm2Exists) {
    Write-Host "      PM2 belum terpasang. Memasang PM2 secara otomatis..." -ForegroundColor Yellow
    try {
        npm install -g pm2 pm2-windows-startup | Out-Null
        $pm2Exists = Get-Command pm2 -ErrorAction SilentlyContinue
    } catch {
        Write-Host "      Gagal auto-install PM2: $_" -ForegroundColor Yellow
    }
}

if ($pm2Exists) {
    # 1. Pastikan ternak-fun aktif
    if (Test-Path "ecosystem.config.cjs") {
        Write-Host "      Me-reload aplikasi ternak-fun..." -ForegroundColor Green
        pm2 startOrReload ecosystem.config.cjs --update-env
    } else {
        pm2 restart ternak-fun 2>$null
        if ($LASTEXITCODE -ne 0) {
            pm2 start server/server.js --name "ternak-fun"
        }
    }

    # 2. Pastikan ternak-tunnel aktif menghubungkan ternak.fun ke port 3001
    if ((Test-Path $CLOUDFLARED_EXE) -and (Test-Path $TUNNEL_JSON)) {
        $pm2List = pm2 jlist | ConvertFrom-Json
        $tunnelRunning = $pm2List | Where-Object { $_.name -eq "ternak-tunnel" }
        if ($tunnelRunning) {
            Write-Host "      Me-restart service ternak-tunnel..." -ForegroundColor Green
            pm2 restart ternak-tunnel
        } else {
            Write-Host "      Mendaftarkan service ternak-tunnel ke PM2..." -ForegroundColor Green
            pm2 start "$CLOUDFLARED_EXE" --name "ternak-tunnel" -- tunnel --credentials-file "$TUNNEL_JSON" run --url http://127.0.0.1:3001 0def092e-cd92-4db7-9eba-9bbfd69c75a8
        }
    }

    pm2 save
    Write-Host "      Semua service PM2 tersimpan aman!" -ForegroundColor Green
} else {
    Write-Host "      [PERINGATAN] PM2 tidak dapat dijalankan. Memulai server via Node..." -ForegroundColor Yellow
    Start-Process -FilePath "node" -ArgumentList "server/server.js" -WindowStyle Hidden
}

Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "   ✅ DEPLOYMENT SELESAI! APLIKASI SUDAH TERBARU         " -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Cyan
