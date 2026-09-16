#!/usr/bin/env bash
# ==============================================================================
# BebekJaya PRO - Linux Deployment Script (Bash)
# Alur: Backup DB -> Git Pull -> Restore Live DB -> npm install -> Build -> PM2 Restart
# ==============================================================================

set -e

echo "========================================================="
echo "   🦆 BEBEKJAYA PRO - AUTO DEPLOYMENT KE LINUX VPS       "
echo "========================================================="

# 1. Direktori Proyek
if [ -n "$APP_DIR" ] && [ -d "$APP_DIR" ]; then
    PROJECT_DIR="$APP_DIR"
else
    PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
fi
cd "$PROJECT_DIR"
echo "[1/6] Direktori kerja: $PROJECT_DIR"

# 2. Backup Database dan .env sebelum update
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="$PROJECT_DIR/server/data/backups"
mkdir -p "$BACKUP_DIR"

DB_FILE="$PROJECT_DIR/server/data/farm_database.json"
TEMP_DB_BACKUP="$BACKUP_DIR/live_db_before_deploy.json"
ENV_FILE="$PROJECT_DIR/.env"
TEMP_ENV_BACKUP="$BACKUP_DIR/live_env_before_deploy.tmp"

if [ -f "$DB_FILE" ]; then
    cp "$DB_FILE" "$BACKUP_DIR/farm_db_backup_$TIMESTAMP.json"
    cp "$DB_FILE" "$TEMP_DB_BACKUP"
    echo "[2/6] Database riil berhasil dibackup ke backups/farm_db_backup_$TIMESTAMP.json"
else
    echo "[2/6] Database belum ada, akan diinisialisasi baru."
fi

if [ -f "$ENV_FILE" ]; then
    cp "$ENV_FILE" "$TEMP_ENV_BACKUP"
fi

# 3. Ambil kode terbaru dari GitHub
echo "[3/6] Menarik pembaruan kode dari GitHub (origin/main)..."
git stash || true
git fetch origin main
git reset --hard origin/main
echo "      Kode berhasil diperbarui ke commit terbaru!"

# 4. Kembalikan file database dan .env riil VPS agar konfigurasi dan data tidak tertimpa
if [ -f "$TEMP_DB_BACKUP" ]; then
    cp "$TEMP_DB_BACKUP" "$DB_FILE"
    rm -f "$TEMP_DB_BACKUP"
    echo "[4/6] Database riil VPS berhasil dipertahankan (data aman)."
fi

if [ -f "$TEMP_ENV_BACKUP" ]; then
    cp "$TEMP_ENV_BACKUP" "$ENV_FILE"
    rm -f "$TEMP_ENV_BACKUP"
    echo "      Konfigurasi produksi .env VPS berhasil dipertahankan."
fi

# 5. Install dependensi & Build Frontend
echo "[5/6] Memeriksa dependensi & build web application..."
npm install --no-audit --no-fund
npm run build
echo "      Build selesai!"

# 6. Restart Server via PM2
echo "[6/6] Memulai ulang proses server..."
if command -v pm2 &> /dev/null; then
    if [ -f "ecosystem.config.cjs" ]; then
        echo "      Me-reload service ternak-fun di PM2 via ecosystem.config.cjs..."
        pm2 startOrReload ecosystem.config.cjs --update-env
        pm2 save
    elif pm2 list | grep -q "ternak-fun\|bebekjaya"; then
        echo "      Me-restart service ternak-fun di PM2..."
        pm2 restart ternak-fun || pm2 restart bebekjaya
        pm2 save
    else
        echo "      Mendaftarkan service ternak-fun ke PM2..."
        pm2 start server/server.js --name "ternak-fun"
        pm2 save
    fi
else
    echo "      [INFO] PM2 belum terpasang. Jalankan manual dengan: npm start"
fi

echo "========================================================="
echo "   ✅ DEPLOYMENT SELESAI! APLIKASI SUDAH TERBARU         "
echo "========================================================="
