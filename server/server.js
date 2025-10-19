
// server/server.js

const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 8080;

// Trust proxy (for Cloud Run)
app.set('trust proxy', 1);

// --- Security Headers ---
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
    hsts: false,
  })
);

// --- Compression ---
app.use(compression());

// --- CORS ---
const allowedOrigin = process.env.FRONTEND_URL || '*';
app.use(cors({ origin: allowedOrigin }));

// --- Logging & Body Parsing ---
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));		

// --- Health Checks ---
app.get('/healthz', (_, res) => res.send('ok'));
app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

// --- Serve React Build ---
const buildPath = path.resolve(__dirname, '/dist');
app.use(express.static(buildPath, { maxAge: '1y', etag: true }));

// SPA fallback for React Router
app.get('*', (_, res) => res.sendFile(path.join(buildPath, 'index.html')));

// --- Error Handling ---
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// --- Start Server ---
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ TREFA server running at http://0.0.0.0:${PORT}`);
});
