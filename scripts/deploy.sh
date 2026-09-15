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

# 2. Backup Database sebelum update
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="$PROJECT_DIR/server/data/backups"
mkdir -p "$BACKUP_DIR"

DB_FILE="$PROJECT_DIR/server/data/farm_database.json"
TEMP_DB_BACKUP="$BACKUP_DIR/live_db_before_deploy.json"

if [ -f "$DB_FILE" ]; then
    cp "$DB_FILE" "$BACKUP_DIR/farm_db_backup_$TIMESTAMP.json"
    cp "$DB_FILE" "$TEMP_DB_BACKUP"
    echo "[2/6] Database riil berhasil dibackup ke backups/farm_db_backup_$TIMESTAMP.json"
else
    echo "[2/6] Database belum ada, akan diinisialisasi baru."
fi

# 3. Ambil kode terbaru dari GitHub
echo "[3/6] Menarik pembaruan kode dari GitHub (origin/main)..."
git stash || true
git fetch origin main
git reset --hard origin/main
echo "      Kode berhasil diperbarui ke commit terbaru!"

# 4. Kembalikan file database riil VPS agar data tidak tertimpa
if [ -f "$TEMP_DB_BACKUP" ]; then
    cp "$TEMP_DB_BACKUP" "$DB_FILE"
    rm -f "$TEMP_DB_BACKUP"
    echo "[4/6] Database riil VPS berhasil dipertahankan (data aman)."
fi

# 5. Install dependensi & Build Frontend
echo "[5/6] Memeriksa dependensi & build web application..."
npm install --omit=dev --no-audit --no-fund
npm run build
echo "      Build selesai!"

# 6. Restart Server via PM2
echo "[6/6] Memulai ulang proses server..."
if command -v pm2 &> /dev/null; then
    if pm2 list | grep -q "bebekjaya"; then
        echo "      Me-restart service bebekjaya di PM2..."
        pm2 restart bebekjaya
    else
        echo "      Mendaftarkan service bebekjaya ke PM2..."
        pm2 start server/server.js --name "bebekjaya"
        pm2 save
    fi
else
    echo "      [INFO] PM2 belum terpasang. Jalankan manual dengan: npm start"
fi

echo "========================================================="
echo "   ✅ DEPLOYMENT SELESAI! APLIKASI SUDAH TERBARU         "
echo "========================================================="
