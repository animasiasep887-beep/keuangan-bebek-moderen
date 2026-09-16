@echo off
cd /d "%~dp0"
title BebekJaya PRO - Setup PM2 Background Service
echo =========================================================
echo    🦆 BEBEKJAYA PRO - SETUP PM2 BACKGROUND SERVICE
echo =========================================================
echo Skrip ini akan mendaftarkan BebekJaya PRO agar:
echo  1. Berjalan di latar belakang tanpa jendela CMD terus terbuka
echo  2. Otomatis restart jika terjadi error / crash
echo  3. Otomatis hidup kembali saat VPS RDP di-restart
echo =========================================================
echo.

where pm2 >nul 2>nul
if %errorlevel% neq 0 (
    echo [1/3] Memasang PM2 secara global...
    call npm install -g pm2 pm2-windows-startup
) else (
    echo [1/3] PM2 sudah terpasang di sistem.
)

echo [2/3] Mendaftarkan BebekJaya (ternak-fun) ke PM2...
call pm2 delete bebekjaya >nul 2>nul
call pm2 delete ternak-fun >nul 2>nul
if exist ecosystem.config.cjs (
    call pm2 start ecosystem.config.cjs
) else (
    call pm2 start server/server.js --name "ternak-fun"
)
call pm2 save

echo [3/3] Mengonfigurasi auto-start saat Windows booting...
call pm2-startup install >nul 2>nul

echo.
echo =========================================================
echo    ✅ SETUP SELESAI! TERNAK.FUN AKTIF DI BACKGROUND
echo =========================================================
echo Perintah berguna:
echo  - pm2 status            : Cek status semua website di VPS
echo  - pm2 logs ternak-fun   : Lihat log server ternak.fun
echo  - pm2 restart ternak-fun: Restart hanya website ternak.fun
echo =========================================================
echo.
pause
