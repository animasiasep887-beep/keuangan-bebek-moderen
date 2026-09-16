@echo off
cd /d "%~dp0"
title BebekJaya PRO - Update Otomatis di VPS
color 0A

echo =========================================================
echo    BEBEKJAYA PRO - AUTO UPDATE DAN RESTART DI VPS
echo =========================================================
echo  [1] Memperbarui script dari GitHub (Self-Healing)...
git fetch origin main
git reset --hard origin/main
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\deploy.ps1"

echo.
echo =========================================================
echo    [SUKSES] UPDATE SELESAI! WEBSITE TERNAK.FUN SUDAH AKTIF
echo =========================================================
echo Perintah cepat PM2:
echo  - pm2 status          : Melihat status semua project di VPS
echo  - pm2 logs ternak-fun : Melihat log aktivitas website
echo =========================================================
echo.
echo Tekan tombol apa saja untuk menutup jendela ini...
pause >nul
