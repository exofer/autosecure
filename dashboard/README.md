# Autosecure Dashboard Website (v2.0)

A high-performance, modern, responsive web dashboard built for the **Autosecure** system. Every single Discord-based feature, slash command, interactive modal, and button has been ported directly to this standalone web application.

---

## 🌟 Key Features & Discord Command Porting

| Discord Feature / Command | Dashboard Section | Capability |
| :--- | :--- | :--- |
| `/secure` | **Securing Studio** | Interactive OTP, 25-digit Recovery Code, Zyger (TOTP), Bulk Recovery batching, and Bulk OTP with live progress. |
| `/secure config` | **Securing Studio -> Rules** | Complete automation switches (exploit, auto_secure, signout, change_ign, multiplayer, oauthapps, removedevices, changegamertag, autoquarantine, checkban, changeprimary, secureifnomc, addzyger, subscribemail, custom DOB, name, pfp, domain). |
| `/accounts` | **Accounts Manager** | Real-time search, sorting, filtering (MC, Capes, No MC), full account inspector modal with credentials copy, extra information drawer (cards, subscriptions, devices, OGO, multiplayer, SSID), and transfer tools. |
| `/accounts download` | **Accounts -> Export** | 1-Click download formatted credentials (`user:mc:capes:rec:email:sec:key:pass`), JSON, CSV, or raw recovery codes list. |
| `/email` & `/mail` | **Webmail Center** | Live inbox viewer, message preview, search, automated OTP / security code extraction with 1-click copy, and custom domain email registration (`user@domain.com`). |
| `/ssidChecker` & `/getSSID` | **Tools -> SSID Checker** | Validate SSID session token, decode JWT expiration epoch, inspect player profile, UUID, capes, and skins. |
| Name & Skin Changing | **Tools -> Skin & IGN** | Direct skin change (classic / slim) and Minecraft username modification via SSID. |
| `/stats` & `/hypixelstatus` | **Tools -> Hypixel Stats** | Live player online status, current game mode, Bedwars stars, Skywars, Duels, and Skyblock Networth calculation. |
| `/cosmetics` | **Tools -> Cosmetics** | Inspect Lunar Client cloaks, cosmetics, and emotes for any valid SSID. |
| `/checklocked` | **Tools -> Check Lock** | Query Microsoft SAF / Alchemy API to verify if an account is suspended or compromised. |
| `/bancheckcommand` | **Tools -> Ban Check** | Check Hypixel network and multiplayer ban status. |
| `/quarantine` | **Tools -> Quarantine Vault** | Protect accounts from lock triggers, view quarantined credentials, release with 1-click. |
| `/requestotp` | **Tools -> Request OTP** | Dispatch verification codes to target Microsoft email or phone security proofs. |
| `/bots` & `/config` | **Bot Fleet** | Multi-bot manager: add bots with token, configure command prefix, activity status, export config JSON, and slot usage monitoring. |
| Embeds & Phisher | **Designer Hub** | Interactive real-time Discord embed previewer, field builder, presets manager, phisher webhook and OAuth settings, and sub-user / team permissions with profit splits. |
| `/proxies` | **Proxy Manager** | Configure rotating residential/datacenter proxies with built-in latency and outgoing IP tester. |
| `/license`, `/trial`, `/recover` | **License Hub** | Active license status, expiration countdown, 1-click 12-hour free trial activator, key voucher redemption, and account data transfer. |
| `/access` & Owner commands | **Owner Control Center** | License key generator (custom days, batch amount, direct user assignment), extend all active keys, user slot manager, blacklist manager, and PM2 bot restart trigger. |

---

## 🚀 How to Run the Dashboard

### 1. Direct Startup
```bash
cd /root/balls/autosecure/dashboard
npm start
```
By default, the server runs on port `3000`:
- **Local:** `http://localhost:3000`
- **Network:** `http://YOUR_VPS_IP:3000`

### 2. Custom Port
```bash
PORT=8080 npm start
```

### 3. Using the Startup Script
```bash
cd /root/balls/autosecure/dashboard
./start.sh
```

### 4. Running Continuously in Background with PM2
```bash
cd /root/balls/autosecure/dashboard
pm2 start server/index.js --name "autosecure-dashboard"
pm2 save
```

---

## 📁 Directory Structure

```
dashboard/
├── package.json               # Node.js dependencies & scripts
├── start.sh                   # Convenient executable startup script
├── README.md                  # Comprehensive documentation
├── server/
│   ├── index.js               # Express application entry point & SPA fallback
│   ├── db.js                  # Database wrapper using Node's native DatabaseSync
│   ├── auth.js                # Auth & session middleware (owner / standard user)
│   ├── routes/
│   │   ├── stats.js           # Overview statistics & leaderboard API
│   │   ├── accounts.js        # Accounts list, filter, details, copy, export, delete
│   │   ├── secure.js          # Securing routes (OTP, Rec code, Zyger, Bulk, Rules)
│   │   ├── emails.js          # Webmail API, search, auto-extracted OTPs, domain register
│   │   ├── tools.js           # SSID checker, skin changer, Hypixel, cosmetics, quarantine
│   │   ├── bots.js            # Bot fleet manager & config exporter
│   │   ├── builder.js         # Visual embed designer, presets, phisher, sub-users
│   │   ├── proxies.js         # Proxy manager & latency tester
│   │   ├── license.js         # License info, redeem key, claim trial, recover/transfer
│   │   └── admin.js           # Master owner console (keys generator, slots, blacklist)
│   └── services/
│       ├── secureService.js   # Core execution bridge for account securing
│       └── minecraftService.js# Mojang & Hypixel API services
└── public/
    ├── index.html             # Single-page dashboard application
    ├── css/
    │   └── styles.css         # Modern obsidian dark theme with responsive styling
    └── js/
        ├── app.js             # Main router & app controller
        ├── api.js             # Centralized API fetch wrapper with toasts
        ├── components/
        │   ├── toasts.js      # Toast notification system
        │   └── modal.js       # Accessible modal dialog engine
        └── views/
            ├── overview.js    # Overview metrics & leaderboard
            ├── accounts.js    # Accounts table, filters, inspector modal
            ├── secure.js      # Securing studio & rules editor
            ├── emails.js      # Webmail reader & code extractor
            ├── tools.js       # Minecraft & security tools
            ├── bots.js        # Bot fleet management
            ├── builder.js     # Discord embed & button designer
            ├── proxies.js     # Proxy manager & tester
            ├── license.js     # License & trial hub
            ├── admin.js       # Master owner control center
            └── guide.js       # Interactive setup documentation
```
