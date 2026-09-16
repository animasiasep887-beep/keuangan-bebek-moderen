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

set "PROJECT_PATH=%~dp0"
if "%PROJECT_PATH:~-1%"=="\" set "PROJECT_PATH=%PROJECT_PATH:~0,-1%"

:: Salin script runner ke folder TEMP agar proses update Git
:: TIDAK PERNAH memutus atau menutup file .bat yang sedang berjalan!
if exist "%PROJECT_PATH%\scripts\deploy.ps1" (
    copy /y "%PROJECT_PATH%\scripts\deploy.ps1" "%TEMP%\bebek_deploy_runner.ps1" >nul 2>&1
) else if exist "scripts\deploy.ps1" (
    copy /y "scripts\deploy.ps1" "%TEMP%\bebek_deploy_runner.ps1" >nul 2>&1
)

if not exist "%TEMP%\bebek_deploy_runner.ps1" (
    echo [PERINGATAN] Menggunakan deploy.ps1 langsung dari folder scripts...
    powershell -NoProfile -ExecutionPolicy Bypass -File "%PROJECT_PATH%\scripts\deploy.ps1" -ProjectDir "%PROJECT_PATH%"
    goto :selesai
)

echo [2/2] Menjalankan pembaruan otomatis (Backup, Git Update, Build, Restart PM2)...
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%TEMP%\bebek_deploy_runner.ps1" -ProjectDir "%PROJECT_PATH%"

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
