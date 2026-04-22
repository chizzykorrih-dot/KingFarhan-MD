const fs = require('fs');
const path = require('path');
const axios = require('axios');

const PREFIX = process.env.PREFIX || '.';
const OWNER = process.env.OWNER_NUMBER || '';

// ── helpers ──────────────────────────────────────────────────────────────────
const reply = (sock, msg, text) =>
  sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg });

const react = (sock, msg, emoji) =>
  sock.sendMessage(msg.key.remoteJid, {
    react: { text: emoji, key: msg.key },
  });

function isOwner(msg) {
  const sender = msg.key.participant || msg.key.remoteJid;
  return sender.replace(/[^0-9]/g, '') === OWNER.replace(/[^0-9]/g, '');
}

// ── command registry ──────────────────────────────────────────────────────────
const commands = {
  // ── INFO ────────────────────────────────────────────────────────────────────
  menu: {
    category: 'info',
    desc: 'Show all commands',
    async exec(sock, msg) {
      await react(sock, msg, '👑');
      const text = `
╔══════════════════════════╗
║   *KingFarhan MD* 👑     ║
╚══════════════════════════╝

> *PREFIX:* \`${PREFIX}\`

╭─── 📋 INFO ───────────────
│ ${PREFIX}menu       - Show this menu
│ ${PREFIX}ping       - Check bot speed
│ ${PREFIX}uptime     - Bot uptime
│ ${PREFIX}info       - Bot information
│ ${PREFIX}owner      - Owner contact
╰───────────────────────────

╭─── 🛠️ TOOLS ──────────────
│ ${PREFIX}calc       - Calculator
│ ${PREFIX}weather    - Get weather
│ ${PREFIX}translate  - Translate text
│ ${PREFIX}tts        - Text to speech
│ ${PREFIX}shorten    - Shorten URL
╰───────────────────────────

╭─── 🎨 FUN ────────────────
│ ${PREFIX}joke       - Random joke
│ ${PREFIX}quote      - Random quote
│ ${PREFIX}fact       - Random fact
│ ${PREFIX}flip       - Coin flip
│ ${PREFIX}dice       - Roll dice
│ ${PREFIX}8ball      - Magic 8-ball
│ ${PREFIX}roast      - Roast someone
│ ${PREFIX}compliment - Compliment
│ ${PREFIX}dare       - Truth or dare
╰───────────────────────────

╭─── 🎵 MEDIA ──────────────
│ ${PREFIX}play       - Play audio
│ ${PREFIX}ytmp3      - YouTube → MP3
│ ${PREFIX}ytmp4      - YouTube → MP4
│ ${PREFIX}tiktok     - TikTok DL
│ ${PREFIX}instagram  - IG DL
│ ${PREFIX}facebook   - FB video DL
╰───────────────────────────

╭─── 👥 GROUP ──────────────
│ ${PREFIX}kick       - Kick member
│ ${PREFIX}add        - Add member
│ ${PREFIX}promote    - Make admin
│ ${PREFIX}demote     - Remove admin
│ ${PREFIX}mute       - Mute group
│ ${PREFIX}unmute     - Unmute group
│ ${PREFIX}groupinfo  - Group details
│ ${PREFIX}tagall     - Tag everyone
│ ${PREFIX}hidetag    - Silent tag all
│ ${PREFIX}setname    - Set group name
│ ${PREFIX}setdesc    - Set group desc
│ ${PREFIX}resetlink  - Reset invite link
│ ${PREFIX}link       - Get invite link
│ ${PREFIX}antilink   - Toggle anti-link
│ ${PREFIX}welcome    - Toggle welcome msg
╰───────────────────────────

╭─── 🔒 OWNER ──────────────
│ ${PREFIX}broadcast  - Broadcast message
│ ${PREFIX}block      - Block user
│ ${PREFIX}unblock    - Unblock user
│ ${PREFIX}clearchat  - Clear chat
│ ${PREFIX}restart    - Restart bot
│ ${PREFIX}shutdown   - Shutdown bot
╰───────────────────────────

╭─── 🤖 AI ─────────────────
│ ${PREFIX}ai         - Ask AI anything
│ ${PREFIX}gpt        - GPT-style chat
╰───────────────────────────

_KingFarhan MD © 2025_`;
      await reply(sock, msg, text);
    },
  },

  ping: {
    category: 'info',
    desc: 'Check bot response speed',
    async exec(sock, msg) {
      const start = Date.now();
      await react(sock, msg, '🏓');
      const ms = Date.now() - start;
      await reply(sock, msg, `🏓 *Pong!*\n⚡ Speed: *${ms}ms*`);
    },
  },

  uptime: {
    category: 'info',
    desc: 'Show bot uptime',
    async exec(sock, msg) {
      const s = process.uptime();
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      const sec = Math.floor(s % 60);
      await reply(sock, msg, `⏱️ *Uptime:* ${h}h ${m}m ${sec}s`);
    },
  },

  info: {
    category: 'info',
    desc: 'Bot information',
    async exec(sock, msg) {
      await reply(sock, msg, `
╔══════════════════════════╗
║   *KingFarhan MD* 👑     ║
╚══════════════════════════╝

📌 *Bot Name:* KingFarhan MD
🤖 *Platform:* WhatsApp MD
📦 *Version:* 1.0.0
⚙️ *Prefix:* ${PREFIX}
🌐 *Library:* Baileys (Multi-Device)
👑 *Owner:* KingFarhan
📅 *Built:* 2025

_Type ${PREFIX}menu for all commands_`);
    },
  },

  owner: {
    category: 'info',
    desc: 'Show owner contact',
    async exec(sock, msg) {
      await reply(sock, msg, `👑 *KingFarhan MD Owner*\n\nContact the owner for support, issues, or custom bot setup.\n\n_Type ${PREFIX}menu for help_`);
    },
  },

  // ── TOOLS ───────────────────────────────────────────────────────────────────
  calc: {
    category: 'tools',
    desc: 'Calculator — .calc 2+2',
    async exec(sock, msg, args) {
      if (!args.length) return reply(sock, msg, `Usage: ${PREFIX}calc 2+2`);
      try {
        // Safe eval using Function
        const expr = args.join(' ').replace(/[^0-9+\-*/().% ]/g, '');
        // eslint-disable-next-line no-new-func
        const result = Function(`"use strict"; return (${expr})`)();
        await reply(sock, msg, `🧮 *Calculator*\n\n📥 Input: \`${expr}\`\n📤 Result: *${result}*`);
      } catch {
        await reply(sock, msg, '❌ Invalid expression.');
      }
    },
  },

  weather: {
    category: 'tools',
    desc: 'Get weather — .weather Nairobi',
    async exec(sock, msg, args) {
      if (!args.length) return reply(sock, msg, `Usage: ${PREFIX}weather <city>`);
      const city = args.join(' ');
      try {
        const res = await axios.get(
          `https://wttr.in/${encodeURIComponent(city)}?format=3`
        );
        await reply(sock, msg, `🌤️ *Weather*\n\n${res.data}`);
      } catch {
        await reply(sock, msg, '❌ Could not fetch weather. Try again.');
      }
    },
  },

  translate: {
    category: 'tools',
    desc: 'Translate text — .translate en Hello',
    async exec(sock, msg, args) {
      if (args.length < 2) return reply(sock, msg, `Usage: ${PREFIX}translate <lang> <text>\nExample: ${PREFIX}translate es Hello world`);
      const lang = args[0];
      const text = args.slice(1).join(' ');
      try {
        const res = await axios.get(
          `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`
        );
        const translated = res.data[0].map((x) => x[0]).join('');
        await reply(sock, msg, `🌐 *Translation*\n\n📥 *Original:* ${text}\n📤 *Translated (${lang}):* ${translated}`);
      } catch {
        await reply(sock, msg, '❌ Translation failed.');
      }
    },
  },

  shorten: {
    category: 'tools',
    desc: 'Shorten a URL — .shorten https://...',
    async exec(sock, msg, args) {
      if (!args[0]) return reply(sock, msg, `Usage: ${PREFIX}shorten <url>`);
      try {
        const res = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(args[0])}`);
        await reply(sock, msg, `🔗 *Shortened URL*\n\n${res.data}`);
      } catch {
        await reply(sock, msg, '❌ Could not shorten URL.');
      }
    },
  },

  // ── FUN ─────────────────────────────────────────────────────────────────────
  joke: {
    category: 'fun',
    desc: 'Random joke',
    async exec(sock, msg) {
      const jokes = [
        "Why don't scientists trust atoms?\nBecause they make up everything! 😂",
        "Why did the scarecrow win an award?\nBecause he was outstanding in his field! 🌾",
        "I told my wife she was drawing her eyebrows too high.\nShe looked surprised. 😄",
        "Why can't you give Elsa a balloon?\nBecause she'll let it go! ❄️",
        "What do you call fake spaghetti?\nAn impasta! 🍝",
        "How do you organize a space party?\nYou planet! 🪐",
        "Why did the bicycle fall over?\nBecause it was two-tired! 🚲",
        "What's a computer's favorite snack?\nMicrochips! 💻",
      ];
      await react(sock, msg, '😂');
      await reply(sock, msg, `😂 *Joke Time!*\n\n${jokes[Math.floor(Math.random() * jokes.length)]}`);
    },
  },

  quote: {
    category: 'fun',
    desc: 'Random inspirational quote',
    async exec(sock, msg) {
      try {
        const res = await axios.get('https://api.quotable.io/random');
        await reply(sock, msg, `💬 *Quote of the Moment*\n\n_"${res.data.content}"_\n\n— *${res.data.author}*`);
      } catch {
        const quotes = [
          { q: 'The only way to do great work is to love what you do.', a: 'Steve Jobs' },
          { q: "In the middle of every difficulty lies opportunity.", a: 'Albert Einstein' },
          { q: 'It does not matter how slowly you go as long as you do not stop.', a: 'Confucius' },
        ];
        const r = quotes[Math.floor(Math.random() * quotes.length)];
        await reply(sock, msg, `💬 *Quote*\n\n_"${r.q}"_\n\n— *${r.a}*`);
      }
    },
  },

  fact: {
    category: 'fun',
    desc: 'Random fun fact',
    async exec(sock, msg) {
      try {
        const res = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en');
        await reply(sock, msg, `🧠 *Random Fact*\n\n${res.data.text}`);
      } catch {
        await reply(sock, msg, '🧠 *Fact:* Honey never spoils. Archaeologists have found 3000-year-old honey in Egyptian tombs that was still edible!');
      }
    },
  },

  flip: {
    category: 'fun',
    desc: 'Flip a coin',
    async exec(sock, msg) {
      const result = Math.random() < 0.5 ? '🪙 *Heads!*' : '🪙 *Tails!*';
      await react(sock, msg, '🪙');
      await reply(sock, msg, result);
    },
  },

  dice: {
    category: 'fun',
    desc: 'Roll a dice',
    async exec(sock, msg, args) {
      const sides = parseInt(args[0]) || 6;
      const roll = Math.floor(Math.random() * sides) + 1;
      await react(sock, msg, '🎲');
      await reply(sock, msg, `🎲 *Dice Roll (d${sides})*\n\nYou rolled: *${roll}*`);
    },
  },

  '8ball': {
    category: 'fun',
    desc: 'Magic 8-ball — .8ball will I win?',
    async exec(sock, msg, args) {
      if (!args.length) return reply(sock, msg, `Usage: ${PREFIX}8ball <question>`);
      const answers = [
        '✅ It is certain.', '✅ Without a doubt.', '✅ Yes, definitely!',
        '✅ You may rely on it.', '✅ Outlook good.', '🔮 Signs point to yes.',
        '❓ Reply hazy, try again.', '❓ Ask again later.', '❓ Cannot predict now.',
        '❌ Don\'t count on it.', '❌ My reply is no.', '❌ Very doubtful.',
      ];
      await react(sock, msg, '🎱');
      await reply(sock, msg, `🎱 *Magic 8-Ball*\n\n❓ ${args.join(' ')}\n\n${answers[Math.floor(Math.random() * answers.length)]}`);
    },
  },

  roast: {
    category: 'fun',
    desc: 'Roast someone — .roast @user',
    async exec(sock, msg, args) {
      const roasts = [
        "You're the reason the gene pool needs a lifeguard. 🏊",
        "I'd agree with you but then we'd both be wrong. 😤",
        "You have your entire life to be an idiot. Why not take today off? 😂",
        "I'm not insulting you, I'm describing you. 💅",
        "Some day you'll go far... and I hope you stay there. ✈️",
      ];
      const target = args.join(' ') || 'you';
      await reply(sock, msg, `🔥 *Roasting ${target}*\n\n${roasts[Math.floor(Math.random() * roasts.length)]}`);
    },
  },

  compliment: {
    category: 'fun',
    desc: 'Compliment someone',
    async exec(sock, msg, args) {
      const compliments = [
        "You light up every room you walk into! ✨",
        "You have an incredible heart. Keep being you! 💖",
        "Your smile is genuinely contagious. 😊",
        "You're smarter than you give yourself credit for. 🧠",
        "The world is a better place with you in it! 🌍",
      ];
      const target = args.join(' ') || 'you';
      await reply(sock, msg, `💌 *Compliment for ${target}*\n\n${compliments[Math.floor(Math.random() * compliments.length)]}`);
    },
  },

  dare: {
    category: 'fun',
    desc: 'Get a truth or dare',
    async exec(sock, msg, args) {
      const type = (args[0] || '').toLowerCase();
      const truths = [
        "What's the most embarrassing thing you've done?",
        "Who was your first crush?",
        "What's your biggest fear?",
        "Have you ever lied to your best friend?",
      ];
      const dares = [
        "Send a voice note singing your favourite song!",
        "Change your profile photo for 1 hour.",
        "Text someone you haven't talked to in months.",
        "Do 20 push-ups right now.",
      ];
      if (type === 'truth') {
        await reply(sock, msg, `🤔 *Truth:*\n\n${truths[Math.floor(Math.random() * truths.length)]}`);
      } else if (type === 'dare') {
        await reply(sock, msg, `😈 *Dare:*\n\n${dares[Math.floor(Math.random() * dares.length)]}`);
      } else {
        const pick = Math.random() < 0.5 ? 'Truth' : 'Dare';
        const list = pick === 'Truth' ? truths : dares;
        const icon = pick === 'Truth' ? '🤔' : '😈';
        await reply(sock, msg, `${icon} *${pick}:*\n\n${list[Math.floor(Math.random() * list.length)]}`);
      }
    },
  },

  // ── AI ──────────────────────────────────────────────────────────────────────
  ai: {
    category: 'ai',
    desc: 'Ask AI anything — .ai what is life?',
    async exec(sock, msg, args) {
      if (!args.length) return reply(sock, msg, `Usage: ${PREFIX}ai <question>`);
      await react(sock, msg, '🤖');
      const question = args.join(' ');
      try {
        const res = await axios.get(
          `https://api.dreaded.site/api/chatgpt?text=${encodeURIComponent(question)}`
        );
        const answer = res.data?.result || res.data?.message || 'No response.';
        await reply(sock, msg, `🤖 *KingFarhan AI*\n\n❓ ${question}\n\n💬 ${answer}`);
      } catch {
        await reply(sock, msg, '❌ AI service unavailable. Try again later.');
      }
    },
  },

  gpt: {
    category: 'ai',
    desc: 'GPT-style chat — .gpt tell me a story',
    async exec(sock, msg, args) {
      if (!args.length) return reply(sock, msg, `Usage: ${PREFIX}gpt <message>`);
      await react(sock, msg, '💬');
      const prompt = args.join(' ');
      try {
        const res = await axios.get(
          `https://api.dreaded.site/api/chatgpt?text=${encodeURIComponent(prompt)}`
        );
        const answer = res.data?.result || res.data?.message || 'No response.';
        await reply(sock, msg, `💬 *GPT Response*\n\n${answer}`);
      } catch {
        await reply(sock, msg, '❌ GPT unavailable right now.');
      }
    },
  },

  // ── GROUP ───────────────────────────────────────────────────────────────────
  kick: {
    category: 'group',
    desc: 'Kick a member (admin only)',
    async exec(sock, msg, args, ctx) {
      if (!ctx.isGroup) return reply(sock, msg, '❌ Groups only.');
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
      if (!mentioned.length) return reply(sock, msg, `Usage: ${PREFIX}kick @user`);
      for (const jid of mentioned) {
        await sock.groupParticipantsUpdate(ctx.from, [jid], 'remove');
      }
      await reply(sock, msg, `✅ Kicked ${mentioned.length} member(s).`);
    },
  },

  add: {
    category: 'group',
    desc: 'Add member — .add 2547XXXXXXXX',
    async exec(sock, msg, args, ctx) {
      if (!ctx.isGroup) return reply(sock, msg, '❌ Groups only.');
      if (!args[0]) return reply(sock, msg, `Usage: ${PREFIX}add <number>`);
      const jid = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
      await sock.groupParticipantsUpdate(ctx.from, [jid], 'add');
      await reply(sock, msg, `✅ Added ${args[0]}.`);
    },
  },

  promote: {
    category: 'group',
    desc: 'Promote to admin (admin only)',
    async exec(sock, msg, args, ctx) {
      if (!ctx.isGroup) return reply(sock, msg, '❌ Groups only.');
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
      if (!mentioned.length) return reply(sock, msg, `Usage: ${PREFIX}promote @user`);
      for (const jid of mentioned) {
        await sock.groupParticipantsUpdate(ctx.from, [jid], 'promote');
      }
      await reply(sock, msg, `✅ Promoted ${mentioned.length} member(s) to admin.`);
    },
  },

  demote: {
    category: 'group',
    desc: 'Remove admin (admin only)',
    async exec(sock, msg, args, ctx) {
      if (!ctx.isGroup) return reply(sock, msg, '❌ Groups only.');
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
      if (!mentioned.length) return reply(sock, msg, `Usage: ${PREFIX}demote @user`);
      for (const jid of mentioned) {
        await sock.groupParticipantsUpdate(ctx.from, [jid], 'demote');
      }
      await reply(sock, msg, `✅ Demoted ${mentioned.length} member(s).`);
    },
  },

  mute: {
    category: 'group',
    desc: 'Mute group (admin only)',
    async exec(sock, msg, _args, ctx) {
      if (!ctx.isGroup) return reply(sock, msg, '❌ Groups only.');
      await sock.groupSettingUpdate(ctx.from, 'announcement');
      await reply(sock, msg, '🔇 Group muted. Only admins can send messages.');
    },
  },

  unmute: {
    category: 'group',
    desc: 'Unmute group (admin only)',
    async exec(sock, msg, _args, ctx) {
      if (!ctx.isGroup) return reply(sock, msg, '❌ Groups only.');
      await sock.groupSettingUpdate(ctx.from, 'not_announcement');
      await reply(sock, msg, '🔊 Group unmuted. Everyone can send messages.');
    },
  },

  groupinfo: {
    category: 'group',
    desc: 'Show group information',
    async exec(sock, msg, _args, ctx) {
      if (!ctx.isGroup) return reply(sock, msg, '❌ Groups only.');
      const meta = await sock.groupMetadata(ctx.from);
      await reply(sock, msg, `
📋 *Group Info*

🏷️ *Name:* ${meta.subject}
🆔 *ID:* ${meta.id}
👤 *Owner:* ${meta.owner || 'Unknown'}
📝 *Desc:* ${meta.desc || 'No description'}
👥 *Members:* ${meta.participants.length}
👑 *Admins:* ${meta.participants.filter((p) => p.admin).length}
📅 *Created:* ${new Date(meta.creation * 1000).toLocaleDateString()}`);
    },
  },

  tagall: {
    category: 'group',
    desc: 'Tag all members (admin only)',
    async exec(sock, msg, args, ctx) {
      if (!ctx.isGroup) return reply(sock, msg, '❌ Groups only.');
      const meta = await sock.groupMetadata(ctx.from);
      const mentions = meta.participants.map((p) => p.id);
      const text = (args.join(' ') || '📢 Attention everyone!') + '\n\n' + mentions.map((m) => `@${m.split('@')[0]}`).join(' ');
      await sock.sendMessage(ctx.from, { text, mentions });
    },
  },

  hidetag: {
    category: 'group',
    desc: 'Silent tag all members',
    async exec(sock, msg, args, ctx) {
      if (!ctx.isGroup) return reply(sock, msg, '❌ Groups only.');
      const meta = await sock.groupMetadata(ctx.from);
      const mentions = meta.participants.map((p) => p.id);
      const text = args.join(' ') || '​'; // zero-width space
      await sock.sendMessage(ctx.from, { text, mentions });
    },
  },

  link: {
    category: 'group',
    desc: 'Get group invite link (admin only)',
    async exec(sock, msg, _args, ctx) {
      if (!ctx.isGroup) return reply(sock, msg, '❌ Groups only.');
      const code = await sock.groupInviteCode(ctx.from);
      await reply(sock, msg, `🔗 *Group Invite Link*\n\nhttps://chat.whatsapp.com/${code}`);
    },
  },

  resetlink: {
    category: 'group',
    desc: 'Reset group invite link (admin only)',
    async exec(sock, msg, _args, ctx) {
      if (!ctx.isGroup) return reply(sock, msg, '❌ Groups only.');
      await sock.groupRevokeInvite(ctx.from);
      const code = await sock.groupInviteCode(ctx.from);
      await reply(sock, msg, `✅ *New Invite Link*\n\nhttps://chat.whatsapp.com/${code}`);
    },
  },

  setname: {
    category: 'group',
    desc: 'Set group name (admin only)',
    async exec(sock, msg, args, ctx) {
      if (!ctx.isGroup) return reply(sock, msg, '❌ Groups only.');
      if (!args.length) return reply(sock, msg, `Usage: ${PREFIX}setname <name>`);
      await sock.groupUpdateSubject(ctx.from, args.join(' '));
      await reply(sock, msg, `✅ Group name updated.`);
    },
  },

  setdesc: {
    category: 'group',
    desc: 'Set group description (admin only)',
    async exec(sock, msg, args, ctx) {
      if (!ctx.isGroup) return reply(sock, msg, '❌ Groups only.');
      if (!args.length) return reply(sock, msg, `Usage: ${PREFIX}setdesc <description>`);
      await sock.groupUpdateDescription(ctx.from, args.join(' '));
      await reply(sock, msg, `✅ Group description updated.`);
    },
  },

  // ── OWNER ───────────────────────────────────────────────────────────────────
  broadcast: {
    category: 'owner',
    desc: 'Broadcast to all chats (owner only)',
    async exec(sock, msg, args) {
      if (!isOwner(msg)) return reply(sock, msg, '❌ Owner only.');
      if (!args.length) return reply(sock, msg, `Usage: ${PREFIX}broadcast <message>`);
      const chats = await sock.groupFetchAllParticipating();
      const ids = Object.keys(chats);
      let sent = 0;
      for (const id of ids) {
        try {
          await sock.sendMessage(id, { text: `📢 *Broadcast from KingFarhan MD*\n\n${args.join(' ')}` });
          sent++;
        } catch {}
      }
      await reply(sock, msg, `✅ Broadcast sent to ${sent} chats.`);
    },
  },

  block: {
    category: 'owner',
    desc: 'Block a user (owner only)',
    async exec(sock, msg, args) {
      if (!isOwner(msg)) return reply(sock, msg, '❌ Owner only.');
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
      const jid = mentioned[0] || (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
      if (!jid) return reply(sock, msg, `Usage: ${PREFIX}block @user`);
      await sock.updateBlockStatus(jid, 'block');
      await reply(sock, msg, `✅ User blocked.`);
    },
  },

  unblock: {
    category: 'owner',
    desc: 'Unblock a user (owner only)',
    async exec(sock, msg, args) {
      if (!isOwner(msg)) return reply(sock, msg, '❌ Owner only.');
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
      const jid = mentioned[0] || (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
      if (!jid) return reply(sock, msg, `Usage: ${PREFIX}unblock @user`);
      await sock.updateBlockStatus(jid, 'unblock');
      await reply(sock, msg, `✅ User unblocked.`);
    },
  },

  restart: {
    category: 'owner',
    desc: 'Restart the bot (owner only)',
    async exec(sock, msg) {
      if (!isOwner(msg)) return reply(sock, msg, '❌ Owner only.');
      await reply(sock, msg, '♻️ Restarting KingFarhan MD...');
      setTimeout(() => process.exit(0), 1000);
    },
  },

  shutdown: {
    category: 'owner',
    desc: 'Shutdown the bot (owner only)',
    async exec(sock, msg) {
      if (!isOwner(msg)) return reply(sock, msg, '❌ Owner only.');
      await reply(sock, msg, '🛑 Shutting down KingFarhan MD. Goodbye!');
      setTimeout(() => process.exit(1), 1000);
    },
  },
};

// ── Main dispatcher ───────────────────────────────────────────────────────────
async function handleCommand(sock, msg, command, args, ctx) {
  const cmd = commands[command];
  if (!cmd) {
    await reply(sock, msg, `❌ Unknown command: *${command}*\nType ${PREFIX}menu for help.`);
    return;
  }
  await cmd.exec(sock, msg, args, ctx);
}

module.exports = { handleCommand, commands };
