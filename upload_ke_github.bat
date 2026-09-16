@echo off
chcp 65001 >nul
cd /d "%~dp0"
title BebekJaya PRO - Upload ke GitHub (1-Klik dari PC)
color 0B

echo =========================================================
echo    🦆 BEBEKJAYA PRO - UPLOAD PEMBARUAN KE GITHUB
echo =========================================================
echo.

echo [1/3] Menyiapkan file dan mengecek perubahan lokal...
git add -A

set CURRENT_TIME=%date% %time%
set DEFAULT_MSG=Pembaruan sistem ternak.fun - %CURRENT_TIME%

echo.
set /p USER_MSG=Pesan catatan update (tekan Enter untuk otomatis): 
if "%USER_MSG%"=="" (
    set FINAL_MSG=%DEFAULT_MSG%
) else (
    set FINAL_MSG=%USER_MSG%
)

echo.
echo [2/3] Menyimpan perubahan (commit)...
git commit -m "%FINAL_MSG%"
if %errorlevel% neq 0 (
    echo [INFO] Tidak ada perubahan kode baru yang perlu di-commit.
)

echo.
echo [3/3] Mengunggah (push) ke GitHub (origin/main)...
git push origin main

if %errorlevel% neq 0 goto :failed_push

echo.
echo =========================================================
echo    ✅ SUKSES! KODE TERBARU SUDAH DI-UPLOAD KE GITHUB
echo =========================================================
echo Langkah selanjutnya:
echo  1. Buka Remote Desktop VPS Anda: 27.50.29.181
echo  2. Klik kanan file 'update_di_vps.bat'
echo  3. Pilih 'Run as administrator'
echo =========================================================
goto :finish

:failed_push
echo.
echo =========================================================
echo    ❌ GAGAL PUSH KE GITHUB
echo =========================================================
echo Periksa koneksi internet Anda atau akun GitHub Anda.

:finish
echo.
echo Tekan tombol apa saja untuk menutup jendela ini...
pause >nul
