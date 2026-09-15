@echo off
title BebekJaya PRO - Update Server Otomatis
echo =========================================================
echo    🦆 BEBEKJAYA PRO - PERBARUI DARI GITHUB KE VPS
echo =========================================================
echo    1. Mem-backup database riil saat ini
echo    2. Menarik kode terbaru dari GitHub
echo    3. Mengembalikan database agar tidak hilang
echo    4. Memperbarui dependensi & build web
echo    5. Me-restart server BebekJaya & Bot Telegram
echo =========================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\deploy.ps1"

echo.
echo Selesai! Tekan tombol apa saja untuk menutup...
pause >nul
