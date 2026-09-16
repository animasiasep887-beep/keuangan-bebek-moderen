$ErrorActionPreference = "Continue"

Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "   PENGHUBUNG DOMAIN TERNAK.FUN KE VPS (OTOMATIS)        " -ForegroundColor Yellow
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Buka Port 80 dan 443 di Firewall
Write-Host "[1/3] Memeriksa dan membuka port 80 dan 443 di Windows Firewall..." -ForegroundColor Cyan
try {
    netsh advfirewall firewall add rule name="Allow Web HTTP 80" dir=in action=allow protocol=TCP localport=80 | Out-Null
    netsh advfirewall firewall add rule name="Allow Web HTTPS 443" dir=in action=allow protocol=TCP localport=443 | Out-Null
    Write-Host "      Port 80 dan 443 siap menerima traffic web." -ForegroundColor Green
} catch {
    Write-Host "      Catatan Firewall: $_" -ForegroundColor Yellow
}

# 2. Periksa dan Unduh Caddy Web Server jika belum ada
Write-Host ""
Write-Host "[2/3] Memeriksa Caddy Web Server (Pengurus SSL Otomatis)..." -ForegroundColor Cyan
$caddyPath = Join-Path $PSScriptRoot "..\caddy.exe"
$caddyPath = [System.IO.Path]::GetFullPath($caddyPath)

if (-not (Test-Path $caddyPath) -or (Get-Item $caddyPath).Length -lt 10000000) {
    Write-Host "      Mengunduh Caddy Web Server (~35MB)..." -ForegroundColor Yellow
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    $wc = New-Object System.Net.WebClient
    $wc.DownloadFile("https://caddyserver.com/api/download?os=windows&arch=amd64", $caddyPath)
    Write-Host "      Caddy Web Server berhasil diunduh!" -ForegroundColor Green
} else {
    Write-Host "      Caddy Web Server sudah siap." -ForegroundColor Green
}

# 3. Pastikan Caddyfile ada
$caddyfilePath = Join-Path $PSScriptRoot "..\Caddyfile"
$caddyfilePath = [System.IO.Path]::GetFullPath($caddyfilePath)
if (-not (Test-Path $caddyfilePath)) {
    $caddyContent = @"
ternak.fun, www.ternak.fun {
    reverse_proxy 127.0.0.1:3001
}
"@
    Set-Content -Path $caddyfilePath -Value $caddyContent -Encoding UTF8
}

# 4. Daftarkan dan Nyalakan Caddy di PM2
Write-Host ""
Write-Host "[3/3] Mendaftarkan Caddy ke PM2 (Auto-Restart dan SSL Otomatis)..." -ForegroundColor Cyan

$pm2Exists = Get-Command pm2 -ErrorAction SilentlyContinue

if ($pm2Exists) {
    try {
        pm2 delete caddy-proxy 2>$null | Out-Null
    } catch {}
    
    $projectRoot = Split-Path -Parent $PSScriptRoot
    Set-Location $projectRoot
    pm2 start caddy.exe --name "caddy-proxy" -- run
    pm2 save
    Write-Host "      Caddy berhasil didaftarkan ke PM2!" -ForegroundColor Green
} else {
    Write-Host "      PM2 belum terpasang. Menjalankan Caddy langsung..." -ForegroundColor Yellow
    Start-Process -FilePath $caddyPath -ArgumentList "run" -WindowStyle Hidden
}

Write-Host ""
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "   [SUKSES] DOMAIN TERNAK.FUN SUDAH BERHASIL TERHUBUNG!   " -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "Caddy otomatis membuat sertifikat SSL (HTTPS) resmi." -ForegroundColor White
Write-Host "Sekarang buka browser di HP / Laptop Anda:" -ForegroundColor Yellow
Write-Host "   👉 https://ternak.fun" -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Cyan
