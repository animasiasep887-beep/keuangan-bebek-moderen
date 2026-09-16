@echo off
cd /d "%~dp0"
title BebekJaya PRO - Update Otomatis di VPS
color 0A

echo =========================================================
echo    BEBEKJAYA PRO - AUTO UPDATE DAN RESTART DI VPS
echo =========================================================
echo  [1] Mem-backup database dan file .env produksi
echo  [2] Menarik kode terbaru dari GitHub (origin/main)
echo  [3] Memulihkan database transaksi dan token produksi
echo  [4] Menginstall dependensi dan build web application
echo  [5] Me-reload service PM2 (ternak-fun) tanpa downtime
echo =========================================================
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
