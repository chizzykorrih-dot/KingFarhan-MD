const { startBot } = require('./src/bot');
const { startPairingServer } = require('./src/pairing-server');

console.log(`
╔══════════════════════════════════════╗
║       KingFarhan MD - Starting...    ║
╚══════════════════════════════════════╝
`);

// Start pairing web server
startPairingServer(3000);

// Start the bot
startBot();
