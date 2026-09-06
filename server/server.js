import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from './database.js';
import { GeminiService } from './geminiService.js';
import { telegramBot } from './telegramBot.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health & status endpoint
app.get('/api/status', (req, res) => {
  const botStatus = telegramBot.getStatus();
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    database: {
      location: path.join(__dirname, 'data', 'farm_database.json'),
      lastUpdated: db.data.lastUpdated,
      persisted: true
    },
    telegramBot: botStatus,
    aiStudio: {
      connected: !!process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash'
    }
  });
});

// User Registration & Login endpoints
app.post('/api/auth/register', (req, res) => {
  const result = db.registerUser(req.body);
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json(result);
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const users = db.data.users || [];
  const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!found || (found.passwordHash && found.passwordHash !== password)) {
    return res.status(401).json({ success: false, message: 'Email atau kata sandi tidak sesuai.' });
  }
  const { passwordHash, ...userWithoutPass } = found;
  res.json({ success: true, user: userWithoutPass });
});

// Get all farm data
app.get('/api/data', (req, res) => {
  const mode = req.query.mode || 'REAL';
  const userId = req.query.userId || 'usr-default-01';
  const data = db.getAllData(mode, userId);
  res.json(data);
});

// Full Sync endpoint
app.post('/api/sync', (req, res) => {
  const mode = req.query.mode || 'REAL';
  const userId = req.query.userId || req.body.userId || 'usr-default-01';
  const updatedData = db.syncAllData(req.body, mode, userId);
  res.json({
    success: true,
    message: 'Data peternakan berhasil disimpan permanen ke disk.',
    data: updatedData
  });
});

// Add daily harvest
app.post('/api/panen', (req, res) => {
  const mode = req.query.mode || 'REAL';
  const userId = req.query.userId || req.body.userId || 'usr-default-01';
  const newLog = db.addPencatatanHarian(req.body, mode, userId);
  res.json({
    success: true,
    data: newLog,
    metrics: db.calculateMetrics(mode, userId)
  });
});

// Add transaction
app.post('/api/transaksi', (req, res) => {
  const mode = req.query.mode || 'REAL';
  const userId = req.query.userId || req.body.userId || 'usr-default-01';
  const newTrx = db.addTransaksiKeuangan(req.body, mode, userId);
  res.json({
    success: true,
    data: newTrx,
    metrics: db.calculateMetrics(mode, userId)
  });
});

// Update daily harvest
app.put('/api/panen/:id', (req, res) => {
  const mode = req.query.mode || 'REAL';
  const userId = req.query.userId || req.body.userId || 'usr-default-01';
  const updated = db.updatePencatatanHarian(req.params.id, req.body, mode, userId);
  res.json({ success: true, data: updated, metrics: db.calculateMetrics(mode, userId) });
});

// Delete daily harvest
app.delete('/api/panen/:id', (req, res) => {
  const mode = req.query.mode || 'REAL';
  const userId = req.query.userId || req.body.userId || 'usr-default-01';
  db.deletePencatatanHarian(req.params.id, mode, userId);
  res.json({ success: true, message: 'Data panen berhasil dihapus.', metrics: db.calculateMetrics(mode, userId) });
});

// Update pakan
app.put('/api/pakan/:id', (req, res) => {
  const mode = req.query.mode || 'REAL';
  const userId = req.query.userId || req.body.userId || 'usr-default-01';
  const updated = db.updatePakan(req.params.id, req.body, mode, userId);
  res.json({ success: true, data: updated });
});

// Delete pakan
app.delete('/api/pakan/:id', (req, res) => {
  const mode = req.query.mode || 'REAL';
  const userId = req.query.userId || req.body.userId || 'usr-default-01';
  db.deletePakan(req.params.id, mode, userId);
  res.json({ success: true, message: 'Data pakan berhasil dihapus.' });
});

// Update transaction
app.put('/api/transaksi/:id', (req, res) => {
  const mode = req.query.mode || 'REAL';
  const userId = req.query.userId || req.body.userId || 'usr-default-01';
  const updated = db.updateTransaksiKeuangan(req.params.id, req.body, mode, userId);
  res.json({ success: true, data: updated, metrics: db.calculateMetrics(mode, userId) });
});

// Delete transaction
app.delete('/api/transaksi/:id', (req, res) => {
  const mode = req.query.mode || 'REAL';
  const userId = req.query.userId || req.body.userId || 'usr-default-01';
  db.deleteTransaksiKeuangan(req.params.id, mode, userId);
  res.json({ success: true, message: 'Transaksi berhasil dihapus.', metrics: db.calculateMetrics(mode, userId) });
});

// AI Farm Consultant Chat
app.post('/api/ai/ask', async (req, res) => {
  try {
    const { question, mode, userId } = req.body;
    const farmData = db.getAllData(mode || 'REAL', userId || 'usr-default-01');
    const answer = await GeminiService.askFarmConsultant(question, farmData);
    res.json({ success: true, answer });
  } catch (error) {
    console.error('[API /api/ai/ask] Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI Automated Farm Performance Analysis
app.get('/api/ai/analysis', async (req, res) => {
  try {
    const mode = req.query.mode || 'REAL';
    const userId = req.query.userId || 'usr-default-01';
    const farmData = db.getAllData(mode, userId);
    const analysis = await GeminiService.getAutomatedAnalysis(farmData);
    res.json({ success: true, analysis });
  } catch (error) {
    console.error('[API /api/ai/analysis] Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Download JSON Backup
app.get('/api/backup/download', (req, res) => {
  const dbPath = path.join(__dirname, 'data', 'farm_database.json');
  res.download(dbPath, `bebekjaya_backup_${new Date().toISOString().slice(0, 10)}.json`);
});

// Reset Real Data
app.post('/api/reset-real', (req, res) => {
  const userId = req.query.userId || req.body.userId || 'usr-default-01';
  const result = db.resetRealData(userId);
  res.json({ success: true, data: result });
});


// Serve frontend static build files directly on http://localhost:3001
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Fallback all non-API routes to index.html (Express 5 compatible)
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(distPath, 'index.html'));
  }
  next();
});

// Start Express Server
app.listen(PORT, async () => {
  console.log(`=======================================================`);
  console.log(`🦆 BebekJaya PRO - Backend Server Aktif di Port ${PORT}`);
  console.log(`💻 Web Dashboard: http://localhost:${PORT}`);
  console.log(`📁 Database Lokasi: ${path.join(__dirname, 'data', 'farm_database.json')}`);
  console.log(`🌐 API Endpoint: http://localhost:${PORT}/api/data`);
  console.log(`=======================================================`);

  // Start Telegram Bot
  await telegramBot.start();
});

