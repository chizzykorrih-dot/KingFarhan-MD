// Shared session store between bot and pairing server
const sessionStore = {
  socket: null,
  saveCreds: null,
  pairingCode: null,
  paired: false,
  pairingRequested: false,
  phoneNumber: null,
};

module.exports = { sessionStore };
