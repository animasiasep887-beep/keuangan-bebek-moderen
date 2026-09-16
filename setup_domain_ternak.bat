@echo off
cd /d "%~dp0"
title Hubungkan Domain ternak.fun ke VPS
color 0B

echo =========================================================
echo    PENGHUBUNG DOMAIN TERNAK.FUN KE VPS (OTOMATIS)
echo =========================================================
echo.

echo [1/3] Membuka port 80 dan 443 di Windows Firewall...
netsh advfirewall firewall add rule name="Allow Web HTTP (80)" dir=in action=allow protocol=TCP localport=80 >nul 2>nul
netsh advfirewall firewall add rule name="Allow Web HTTPS (443)" dir=in action=allow protocol=TCP localport=443 >nul 2>nul
echo       Port 80 dan 443 siap menerima traffic web.

echo.
echo [2/3] Memeriksa Caddy Web Server (Pengurus SSL Otomatis)...
if not exist "caddy.exe" (
    echo       Mengunduh Caddy Web Server (~30MB)...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object System.Net.WebClient).DownloadFile('https://caddyserver.com/api/download?os=windows&arch=amd64', 'caddy.exe')"
)

if exist "caddy.exe" (
    echo       Caddy Web Server siap!
) else (
    echo       [GAGAL] Gagal mengunduh caddy.exe. Pastikan koneksi internet VPS aktif.
    pause
    exit /b 1
)

echo.
echo [3/3] Mendaftarkan Caddy ke PM2 (Auto-Restart dan SSL Otomatis)...
call pm2 delete caddy-proxy >nul 2>nul
call pm2 start caddy.exe --name "caddy-proxy" -- run
call pm2 save

echo.
echo =========================================================
echo    [SUKSES] DOMAIN TERNAK.FUN SUDAH TERHUBUNG!
echo =========================================================
echo Caddy otomatis membuat sertifikat SSL (HTTPS) resmi.
echo Sekarang Anda bisa langsung membuka website di HP / Laptop:
echo   https://ternak.fun
echo =========================================================
echo.
echo Tekan tombol apa saja untuk menutup jendela ini...
pause >nul
