# 👑 KingFarhan MD

> WhatsApp Multi-Device Bot with web-based pairing

---

## 🚀 Quick Setup

### 1. Install dependencies
```bash
cd kingfarhan-md
npm install
```

### 2. Configure
```bash
cp .env.example .env
```
Edit `.env` and set:
- `OWNER_NUMBER` — your WhatsApp number with country code (e.g. `254712345678`)
- `PREFIX` — command prefix (default `.`)

### 3. Start the bot
```bash
npm start
```

### 4. Pair your WhatsApp
Open your browser at **http://localhost:3000**

- Enter your WhatsApp number
- Click **Generate Pairing Code**
- Open WhatsApp → ⋮ → Linked Devices → Link a Device
- Tap **"Link with phone number instead"**
- Enter the 8-digit code shown on the site

---

## 📋 All Commands

| Command | Description |
|---------|-------------|
| `.menu` | Show all commands |
| `.ping` | Check bot response speed |
| `.uptime` | Show bot uptime |
| `.info` | Bot information |
| `.owner` | Owner contact |
| `.calc <expr>` | Calculator — `.calc 2+2*5` |
| `.weather <city>` | Get current weather |
| `.translate <lang> <text>` | Translate text |
| `.shorten <url>` | Shorten a URL |
| `.joke` | Random joke |
| `.quote` | Inspirational quote |
| `.fact` | Random fun fact |
| `.flip` | Flip a coin |
| `.dice [sides]` | Roll a dice |
| `.8ball <question>` | Magic 8-ball |
| `.roast [@user]` | Roast someone |
| `.compliment [@user]` | Compliment someone |
| `.dare [truth/dare]` | Truth or dare |
| `.ai <question>` | Ask AI anything |
| `.gpt <message>` | GPT-style chat |
| `.kick @user` | Kick group member (admin) |
| `.add <number>` | Add to group (admin) |
| `.promote @user` | Make admin (admin) |
| `.demote @user` | Remove admin (admin) |
| `.mute` | Mute group (admin) |
| `.unmute` | Unmute group (admin) |
| `.groupinfo` | Group details |
| `.tagall [msg]` | Tag all members (admin) |
| `.hidetag [msg]` | Silent tag all (admin) |
| `.link` | Get invite link (admin) |
| `.resetlink` | Reset invite link (admin) |
| `.setname <name>` | Set group name (admin) |
| `.setdesc <desc>` | Set group description (admin) |
| `.broadcast <msg>` | Broadcast to all chats (owner) |
| `.block @user` | Block user (owner) |
| `.unblock @user` | Unblock user (owner) |
| `.restart` | Restart bot (owner) |
| `.shutdown` | Shutdown bot (owner) |

---

## 🗂️ Project Structure

```
kingfarhan-md/
├── index.js              # Entry point
├── package.json
├── .env.example
├── .gitignore
├── src/
│   ├── bot.js            # Baileys connection & message handler
│   ├── commands.js       # All 40+ bot commands
│   ├── pairing-server.js # Express web server for pairing
│   └── session-store.js  # Shared state between bot & server
└── public/
    └── index.html        # Pairing website (served at localhost:3000)
```

---

## ⚙️ Requirements

- Node.js **v18+**
- An active WhatsApp account

---

## 👑 Made by KingFarhan
