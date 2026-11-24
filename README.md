# Autosecure - Bot & Web Management Dashboard

Autosecure is an enterprise-grade Minecraft & Microsoft account security, authentication, management, and verification system. It includes both a multi-bot Discord engine and a modern web dashboard.

---

## 🚀 Features

### 1. Multi-Bot Discord Engine (`/autosecure` & `/mainbot`)
- **Securing Engine:** OTP, 25-character recovery code, MSAUTH, Zyger (Password + Secret Key TOTP), bulk recovery, and bulk OTP.
- **Automations:** Exploit protection, auto-quarantine, alias modification, primary email changes, device signout, and ban checking.
- **Account Management:** Credential tracking, Minecraft licensing checks, Hypixel stats & networth valuation, cosmetic inspection (Lunar, LabyMod, OptiFine).
- **Communication:** Multi-bot token management, customizable Discord embeds, buttons, modals, and preset templates.
- **Email Server & Webmail:** Custom domain mail routing, inbox monitoring, and automated verification code extraction.

### 2. Full Web Dashboard (`/dashboard`)
A responsive, high-craft web dashboard designed to manage every aspect of Autosecure directly from the browser:
- **Overview Dashboard:** Live counters, account stats, Skyblock networth valuation, and system metrics.
- **Accounts Manager:** Full accounts table, search, filters, account detail inspector, credentials copier, and export tools (TXT, JSON, CSV).
- **Securing Studio:** Interactive securing forms (OTP, Rec Code, Zyger, Bulk) and complete configuration rules editor.
- **Webmail Center:** Live inbox, search, 1-click OTP extraction badge, and domain email registration.
- **Tools Suite:** SSID checker, token expiration decoder, 3D skin changer, IGN changer, Hypixel stats & online status, Lunar cosmetics, ban checker, Microsoft account lock checker, and quarantine vault.
- **Bot Fleet:** Manage multiple bot instances, prefixes, activities, and export configuration.
- **Designer Hub:** Real-time visual Discord embed designer, presets hub, phisher webhook/OAuth configuration, and team sub-users management with profit splits.
- **Proxy Manager:** Manage rotating proxies with built-in latency and IP verification.
- **Owner Control Center:** License generator, batch key creation, subscription extension, user slot allocation, blacklist manager, and PM2 bot process restart.

---

## 🛠️ Quick Start

### Prerequisites
- Node.js 20+
- SQLite3 (built-in support via `node:sqlite`)
- PM2 (optional, for persistent background management)

### 1. Configure Bot & Secrets
Edit `config.json` with your Discord tokens, domain names, and owner ID:
```json
{
  "tokens": ["YOUR_BOT_TOKEN"],
  "owners": ["YOUR_DISCORD_USER_ID"],
  "domains": ["yourdomain.com"],
  "authkey": "YOUR_AUTH_KEY"
}
```

### 2. Start the Discord Bot
```bash
# Install dependencies
npm install

# Start the bot
npm start

# Or with PM2
pm2 start autosecure.js --name "autosecure"
pm2 save
```

### 3. Start the Web Dashboard
```bash
cd dashboard

# Install dashboard dependencies
npm install

# Start web server
npm start
# The dashboard will be available at http://localhost:3000
```

---

## 📁 Repository Structure

```
autosecure/
├── autosecure/                # Sub-bot engine, handlers, and security utilities
├── mainbot/                   # Controller bot, slash commands, events, and modals
├── dashboard/                 # Standalone web dashboard application
│   ├── server/                # Express backend, SQLite bridge, and REST API
│   │   ├── routes/            # 10 Dedicated API routes
│   │   └── services/          # Securing & Minecraft services
│   └── public/                # Responsive dark-theme Single Page Application (SPA)
│       ├── css/styles.css     # Obsidian theme & responsive design
│       └── js/                # Modular view controllers & component engines
├── db/                        # SQLite database client & schema definitions
├── store/                     # Assets loader, cosmetics, and emote data
├── config.json                # Main configuration file
├── package.json               # Bot dependencies
└── logger.js                  # Logging utility
```

---

## 📜 License
ISC License.
