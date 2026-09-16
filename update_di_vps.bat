@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0"
title BebekJaya PRO - Update Otomatis di VPS
color 0A

echo =========================================================
echo    BEBEKJAYA PRO - AUTO UPDATE DAN RESTART DI VPS
echo =========================================================
echo.
echo [1/2] Menyiapkan runner pembaruan sistem...

:: Salin script runner ke folder TEMP agar proses update Git
:: TIDAK PERNAH memutus atau menutup file .bat yang sedang berjalan!
if exist "%~dp0scripts\deploy.ps1" (
    copy /y "%~dp0scripts\deploy.ps1" "%TEMP%\bebek_deploy_runner.ps1" >nul 2>&1
) else if exist "scripts\deploy.ps1" (
    copy /y "scripts\deploy.ps1" "%TEMP%\bebek_deploy_runner.ps1" >nul 2>&1
)

if not exist "%TEMP%\bebek_deploy_runner.ps1" (
    echo [PERINGATAN] Menggunakan deploy.ps1 langsung dari folder scripts...
    powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\deploy.ps1" -ProjectDir "%~dp0"
    goto :selesai
)

echo [2/2] Menjalankan pembaruan otomatis (Backup, Git Update, Build, Restart PM2)...
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%TEMP%\bebek_deploy_runner.ps1" -ProjectDir "%~dp0"

:selesai
set DEPLOY_EXIT=%ERRORLEVEL%
echo.
if %DEPLOY_EXIT% EQU 0 (
    echo =========================================================
    echo   [SUKSES] WEBSITE TERNAK.FUN TELAH BERHASIL DIPERBARUI!
    echo =========================================================
) else (
    echo =========================================================
    echo   [SELESAI] Silakan periksa pesan di atas (Kode: %DEPLOY_EXIT%).
    echo =========================================================
)

echo Perintah cepat PM2 di VPS:
echo  - pm2 status          : Melihat status service
echo  - pm2 logs ternak-fun : Melihat log aktivitas website
echo =========================================================
echo.
echo Tekan tombol apa saja untuk menutup jendela ini...
pause >nul
