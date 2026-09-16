@echo off
cd /d "%~dp0"
title BebekJaya PRO - Update Otomatis di VPS
color 0A

echo =========================================================
echo    BEBEKJAYA PRO - AUTO UPDATE DAN RESTART DI VPS
echo =========================================================

:: 1. Amankan file database riil dan .env sebelum git update apapun
if not exist "backups_vps_safe" mkdir "backups_vps_safe"
if exist "server\data\farm_database.json" (
    copy /y "server\data\farm_database.json" "backups_vps_safe\farm_database_pre_update.json" >nul
    echo  [1/4] Database member dan transaksi aman dibackup.
) else (
    echo  [1/4] Menyiapkan database baru.
)
if exist ".env" (
    copy /y ".env" "backups_vps_safe\env_pre_update.tmp" >nul
)

:: 2. Update kode terbaru dari GitHub
echo  [2/4] Menarik pembaruan kode dari GitHub (origin/main)...
git fetch origin main
git reset --hard origin/main
echo.

:: 3. Kembalikan database riil VPS agar data member TIDAK PERNAH HILANG
if exist "backups_vps_safe\farm_database_pre_update.json" (
    copy /y "backups_vps_safe\farm_database_pre_update.json" "server\data\farm_database.json" >nul
    echo  [3/4] Database member berhasil dipulihkan (100 persen aman).
)
if exist "backups_vps_safe\env_pre_update.tmp" (
    copy /y "backups_vps_safe\env_pre_update.tmp" ".env" >nul
)

echo.
echo  [4/4] Menjalankan build dan reload service server...
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
