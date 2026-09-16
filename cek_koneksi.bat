@echo off
cd /d "%~dp0"
title Cek Status dan Log Caddy di VPS
color 0E

echo =========================================================
echo    DIAGNOSTIK KONEKSI DAN LOG CADDY DI VPS
echo =========================================================
echo.

echo [1] Status PM2:
call pm2 status

echo.
echo [2] Memeriksa apakah Port 80, 443, dan 3001 sedang aktif:
netstat -ano | findstr ":80 :443 :3001"

echo.
echo [3] Log Terakhir Caddy Web Server:
call pm2 logs caddy-proxy --lines 20 --nostream

echo.
echo =========================================================
echo Selesai. Tekan tombol apa saja untuk menutup...
pause >nul
