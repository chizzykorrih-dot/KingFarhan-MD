const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  makeInMemoryStore,
  jidNormalizedUser,
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const path = require('path');
const fs = require('fs');
const { handleCommand } = require('./commands');
const { sessionStore } = require('./session-store');

const AUTH_DIR = path.join(__dirname, '../auth_info');
const logger = pino({ level: 'silent' });

let globalSock = null;

function getSocket() {
  return globalSock;
}

async function startBot() {
  if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    browser: ['KingFarhan MD', 'Chrome', '120.0.0'],
    syncFullHistory: false,
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: true,
  });

  globalSock = sock;

  // Save pairing code state
  sessionStore.socket = sock;
  sessionStore.saveCreds = saveCreds;

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr, pairingCode } = update;

    if (pairingCode) {
      sessionStore.pairingCode = pairingCode;
      console.log(`\n📱 Pairing Code: ${pairingCode}\n`);
    }

    if (connection === 'close') {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('Connection closed. Reconnecting:', shouldReconnect);
      if (shouldReconnect) {
        setTimeout(startBot, 3000);
      } else {
        // Logged out — clear auth
        fs.rmSync(AUTH_DIR, { recursive: true, force: true });
        sessionStore.pairingCode = null;
        sessionStore.paired = false;
        console.log('Logged out. Auth cleared.');
      }
    } else if (connection === 'open') {
      sessionStore.paired = true;
      sessionStore.pairingCode = null;
      const user = sock.user;
      console.log(`\n✅ Bot connected as: ${user?.name} (${user?.id})\n`);
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue;

      const from = msg.key.remoteJid;
      const isGroup = from.endsWith('@g.us');
      const body =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.imageMessage?.caption ||
        msg.message?.videoMessage?.caption ||
        '';

      const prefix = process.env.PREFIX || '.';
      if (!body.startsWith(prefix)) continue;

      const args = body.slice(prefix.length).trim().split(/\s+/);
      const command = args.shift().toLowerCase();

      console.log(`[CMD] ${from} → ${prefix}${command} ${args.join(' ')}`);

      try {
        await handleCommand(sock, msg, command, args, { from, isGroup, body });
      } catch (err) {
        console.error('Command error:', err);
        await sock.sendMessage(from, { text: '❌ An error occurred: ' + err.message });
      }
    }
  });

  return sock;
}

module.exports = { startBot, getSocket };
