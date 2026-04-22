const express = require('express');
const path = require('path');
const { sessionStore } = require('./session-store');

function startPairingServer(port = 3000) {
  const app = express();
  app.use(express.json());
  app.use(express.static(path.join(__dirname, '../public')));

  // ── API: Request pairing code ─────────────────────────────────────────────
  app.post('/api/pair', async (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.json({ success: false, error: 'Phone number required.' });

    const cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.length < 10) return res.json({ success: false, error: 'Invalid phone number.' });

    try {
      const sock = sessionStore.socket;
      if (!sock) return res.json({ success: false, error: 'Bot not ready. Please wait...' });

      if (sessionStore.paired) {
        return res.json({ success: false, error: 'Bot already paired. Logout first.' });
      }

      // Request pairing code from WhatsApp
      const code = await sock.requestPairingCode(cleaned);
      sessionStore.pairingCode = code;
      sessionStore.phoneNumber = cleaned;

      return res.json({ success: true, code });
    } catch (err) {
      console.error('Pairing error:', err);
      return res.json({ success: false, error: err.message || 'Failed to generate pairing code.' });
    }
  });

  // ── API: Check pairing status ─────────────────────────────────────────────
  app.get('/api/status', (req, res) => {
    res.json({
      paired: sessionStore.paired,
      code: sessionStore.pairingCode,
      phone: sessionStore.phoneNumber,
    });
  });

  // ── API: Logout / unpair ──────────────────────────────────────────────────
  app.post('/api/logout', async (req, res) => {
    try {
      if (sessionStore.socket) {
        await sessionStore.socket.logout();
      }
      res.json({ success: true });
    } catch (err) {
      res.json({ success: false, error: err.message });
    }
  });

  // ── Serve pairing site ────────────────────────────────────────────────────
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  });

  app.listen(port, () => {
    console.log(`🌐 KingFarhan MD Pairing Site: http://localhost:${port}`);
  });
}

module.exports = { startPairingServer };
