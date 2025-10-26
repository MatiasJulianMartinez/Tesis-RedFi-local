require('dotenv').config();

const express = require('express');
const cors = require('cors');

const { testSpeedHandler } = require('./api-handlers');

const app = express();
// Usa el puerto de Render si existe, si no SERVER_PORT o 8000
const PORT = process.env.PORT || process.env.SERVER_PORT || 8000;

app.use(cors({ origin: '*', optionsSuccessStatus: 200 }));

// Endpoint de salud para verificar que el server está vivo
app.get('/health', (req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

// Endpoint principal del speedtest
app.get('/', async (req, res) => {
  try {
    const { status, data } = await testSpeedHandler();
    res.status(status || 500).json(data);
  } catch (err) {
    res.status(500).json({
      error: 'Server error',
      detail: String(err && err.message ? err.message : err),
    });
  }
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
