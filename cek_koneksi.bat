@echo off
cd /d "%~dp0"
title Cek Status BebekJaya dan Cloudflare Tunnel (ternak.fun)
color 0A

echo =========================================================
echo    STATUS BEBEKJAYA PRO & CLOUDFLARE TUNNEL (ternak.fun)
echo =========================================================
echo.

echo [1] Status Layanan PM2 di VPS:
call pm2 status

echo.
echo [2] Memeriksa Port 3001 (Server BebekJaya):
netstat -ano | findstr ":3001"

echo.
echo [3] Log Cloudflare Tunnel (ternak-tunnel):
call pm2 logs ternak-tunnel --lines 15 --nostream

echo.
echo =========================================================
echo Selesai. Tekan tombol apa saja untuk menutup...
pause >nul

