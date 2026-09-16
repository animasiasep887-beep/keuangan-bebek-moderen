@echo off
cd /d "%~dp0"
title Hubungkan Domain ternak.fun ke VPS
color 0B

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\setup_caddy.ps1"

echo.
echo Tekan tombol apa saja untuk menutup jendela ini...
pause >nul
