const { createCanvas, loadImage, registerFont } = require("canvas");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

/* ───────── FONT SETUP ───────── */
const minecraftiaPath = path.join(__dirname, "assets/fonts/minecraftia.ttf");
const minecraftPath = path.join(__dirname, "assets/fonts/minecraft.ttf");
if (fs.existsSync(minecraftiaPath)) {
  registerFont(minecraftiaPath, { family: "Minecraftia" });
} else {
  console.warn("[makeCard] Minecraftia font missing:", minecraftiaPath);
}
if (fs.existsSync(minecraftPath)) {
  registerFont(minecraftPath, { family: "Minecraft" });
}

/* ───────── RANK COLORS ───────── */
const RANK_COLORS = {
  OWNER: { main: "#FF5555", plus: "#FF5555", glow: "rgba(255, 85, 85, 0.35)", label: "OWNER" },
  ADMIN: { main: "#FF5555", plus: "#FF5555", glow: "rgba(255, 85, 85, 0.35)", label: "ADMIN" },
  HELPER: { main: "#5555FF", plus: "#5555FF", glow: "rgba(85, 85, 255, 0.35)", label: "HELPER" },
  MOD: { main: "#00AA00", plus: "#00AA00", glow: "rgba(0, 170, 0, 0.35)", label: "MOD" },
  YOUTUBE: { main: "#FF5555", plus: "#FFFFFF", glow: "rgba(255, 85, 85, 0.35)", label: "YOUTUBE" },
  "MVP++": { main: "#FFAA00", plus: "#FF5555", glow: "rgba(255, 170, 0, 0.38)", label: "MVP++" },
  "MVP+": { main: "#55FFFF", plus: "#FF5555", glow: "rgba(85, 255, 255, 0.34)", label: "MVP+" },
  MVP: { main: "#55FFFF", plus: "#55FFFF", glow: "rgba(85, 255, 255, 0.32)", label: "MVP" },
  "VIP+": { main: "#55FF55", plus: "#FFAA00", glow: "rgba(85, 255, 85, 0.32)", label: "VIP+" },
  VIP: { main: "#55FF55", plus: "#55FF55", glow: "rgba(85, 255, 85, 0.30)", label: "VIP" },
  NONE: { main: "#F59E0B", plus: "#F59E0B", glow: "rgba(245, 158, 11, 0.30)", label: "PLAYER" }
};

const PLUS_HEX = {
  RED: "#FF5555",
  GOLD: "#FFAA00",
  GREEN: "#55FF55",
  YELLOW: "#FFFF55",
  LIGHT_PURPLE: "#FF55FF",
  WHITE: "#FFFFFF",
  BLUE: "#5555FF",
  DARK_GREEN: "#00AA00",
  DARK_RED: "#AA0000",
  DARK_AQUA: "#00AAAA",
  DARK_PURPLE: "#AA00AA",
  DARK_GRAY: "#555555",
  BLACK: "#111111",
  DARK_BLUE: "#0000AA"
};

/* ───────── UTIL FUNCTIONS ───────── */
function obscureUsername(name) {
  if (!name || typeof name !== "string") return "Unknown";
  if (name.length < 3) return name[0] + "•".repeat(Math.max(1, name.length - 1));
  return `${name[0]}${"•".repeat(Math.min(10, name.length - 2))}${name.at(-1)}`;
}

function formatCompact(val) {
  if (val === null || val === undefined || val === "" || val === "Unknown") return "0";
  if (typeof val === "string" && /[a-zA-Z]$/.test(val.trim()) && !isNaN(parseFloat(val))) {
    return val.trim();
  }
  const num = Number(String(val).replace(/,/g, ""));
  if (isNaN(num)) return String(val);
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return String(Math.round(num));
}

function formatKdr(val) {
  const num = Number(val);
  if (isNaN(num)) return String(val ?? "0");
  return num.toFixed(2).replace(/\.00$/, "");
}

function resolveRankTheme(stats) {
  const rawRank = String(stats.rank || "").toUpperCase().replace(/[\[\]\s]/g, "");
  let key = "NONE";
  if (rawRank.includes("MVP++") || rawRank === "SUPERSTAR") key = "MVP++";
  else if (rawRank.includes("MVP+")) key = "MVP+";
  else if (rawRank.includes("MVP")) key = "MVP";
  else if (rawRank.includes("VIP+")) key = "VIP+";
  else if (rawRank.includes("VIP")) key = "VIP";
  else if (RANK_COLORS[rawRank]) key = rawRank;
  else if (stats.plusColour && stats.plusColour !== "None") key = "MVP+";

  const base = { ...RANK_COLORS[key] };
  const plusKey = String(stats.plusColour || "").toUpperCase();
  if (PLUS_HEX[plusKey]) base.plus = PLUS_HEX[plusKey];
  return base;
}

function roundRectPath(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawCoverImage(ctx, img, w, h) {
  const scale = Math.max(w / img.width, h / img.height);
  const sw = img.width * scale;
  const sh = img.height * scale;
  ctx.drawImage(img, (w - sw) / 2, (h - sh) / 2, sw, sh);
}

function drawFittedText(ctx, text, x, y, maxWidth, fontFamily, startSize, minSize = 14) {
  let size = startSize;
  while (size > minSize) {
    ctx.font = `${size}px ${fontFamily}`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 1;
  }
  ctx.font = `${size}px ${fontFamily}`;
  ctx.fillText(text, x, y);
}

async function loadAvatar(username) {
  const imageDir = path.join(__dirname, "db/image");
  fs.mkdirSync(imageDir, { recursive: true });
  const safeName = encodeURIComponent(username);
  const avatarPath = path.join(imageDir, `${username.toLowerCase()}_3d.png`);

  if (fs.existsSync(avatarPath)) {
    try {
      return await loadImage(avatarPath);
    } catch {
      // fall through to re-fetch if cached file is corrupt
    }
  }

  const sources = [
    `https://visage.surgeplay.com/full/512/${safeName}.png?y=-35&quality=lossless`,
    `https://mc-heads.net/body/${safeName}/384`,
    `https://minotar.net/body/${safeName}/384`
  ];

  for (const url of sources) {
    try {
      const res = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: 8000,
        headers: { "User-Agent": "Mozilla/5.0" }
      });
      if (res.data && res.data.byteLength > 256) {
        fs.writeFileSync(avatarPath, res.data);
        return await loadImage(avatarPath);
      }
    } catch {
      // try next avatar source
    }
  }

  return null;
}

/* ───────── MAIN IMAGE CREATOR ───────── */
async function makeCard(stats, outputPath = "output.png") {
  const WIDTH = 1200;
  const HEIGHT = 640;

  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  const theme = resolveRankTheme(stats);
  const username = String(stats.username || "Player");

  /* ───────── BACKGROUND ───────── */
  ctx.fillStyle = "#090B10";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  try {
    const bgDir = path.join(__dirname, "assets/backgrounds");
    const files = fs.existsSync(bgDir)
      ? fs.readdirSync(bgDir).filter(f => /\.(png|jpg|jpeg)$/i.test(f))
      : [];
    const fallbackBg = path.join(__dirname, "assets/bg.png");
    const bgFile = files.length > 0
      ? path.join(bgDir, files[Math.floor(Math.random() * files.length)])
      : (fs.existsSync(fallbackBg) ? fallbackBg : null);

    if (bgFile) {
      const bg = await loadImage(bgFile);
      ctx.save();
      ctx.globalAlpha = 0.34;
      drawCoverImage(ctx, bg, WIDTH, HEIGHT);
      ctx.restore();
    }
  } catch {
    // base dark gradient remains
  }

  // Deep atmospheric gradient + subtle vignette
  const bgGrad = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  bgGrad.addColorStop(0, "rgba(10, 12, 18, 0.86)");
  bgGrad.addColorStop(0.55, "rgba(13, 17, 25, 0.78)");
  bgGrad.addColorStop(1, "rgba(8, 10, 15, 0.92)");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Subtle ambient glow behind character showcase & header accent
  const charGlow = ctx.createRadialGradient(230, 320, 20, 230, 320, 290);
  charGlow.addColorStop(0, theme.glow);
  charGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = charGlow;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const topRightGlow = ctx.createRadialGradient(1040, 90, 10, 1040, 90, 320);
  topRightGlow.addColorStop(0, "rgba(245, 158, 11, 0.14)");
  topRightGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = topRightGlow;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Subtle dot grid texture
  ctx.fillStyle = "rgba(255, 255, 255, 0.035)";
  for (let gx = 28; gx < WIDTH; gx += 28) {
    for (let gy = 28; gy < HEIGHT; gy += 28) {
      ctx.fillRect(gx, gy, 1.5, 1.5);
    }
  }

  /* ───────── OUTER FRAME ───────── */
  roundRectPath(ctx, 20, 20, WIDTH - 40, HEIGHT - 40, 24);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  /* ───────── LEFT CHARACTER SHOWCASE CARD ───────── */
  const leftX = 44;
  const leftY = 44;
  const leftW = 340;
  const leftH = HEIGHT - 88;

  ctx.save();
  roundRectPath(ctx, leftX, leftY, leftW, leftH, 20);
  ctx.fillStyle = "rgba(15, 19, 28, 0.78)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.10)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Top accent hairline on showcase card
  ctx.clip();
  const topLineGrad = ctx.createLinearGradient(leftX, leftY, leftX + leftW, leftY);
  topLineGrad.addColorStop(0, "rgba(255,255,255,0)");
  topLineGrad.addColorStop(0.5, theme.main);
  topLineGrad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = topLineGrad;
  ctx.fillRect(leftX, leftY, leftW, 3);

  // Pedestal ground shadow
  ctx.beginPath();
  ctx.ellipse(leftX + leftW / 2, leftY + leftH - 74, 96, 18, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
  ctx.fill();

  const avatar = await loadAvatar(username);
  if (avatar) {
    const maxAw = 265;
    const maxAh = 415;
    const scale = Math.min(maxAw / avatar.width, maxAh / avatar.height);
    const dw = avatar.width * scale;
    const dh = avatar.height * scale;
    const dx = leftX + (leftW - dw) / 2;
    const dy = leftY + leftH - 72 - dh;
    ctx.shadowColor = "rgba(0, 0, 0, 0.65)";
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 10;
    ctx.drawImage(avatar, dx, dy, dw, dh);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  } else {
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.font = "bold 64px DejaVu Sans";
    ctx.textAlign = "center";
    ctx.fillText("?", leftX + leftW / 2, leftY + leftH / 2);
    ctx.textAlign = "left";
  }

  // Bottom mini badge inside showcase card
  ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
  ctx.font = "bold 12px DejaVu Sans";
  ctx.textAlign = "center";
  ctx.fillText("SECURED ACCOUNT PROFILE", leftX + leftW / 2, leftY + leftH - 24);
  ctx.textAlign = "left";
  ctx.restore();

  /* ───────── RIGHT HEADER ───────── */
  const rightX = 416;
  const rightW = WIDTH - rightX - 44;

  // Rank pill
  ctx.font = "bold 14px DejaVu Sans";
  const rankLabel = theme.label;
  const rankPillW = Math.max(76, ctx.measureText(rankLabel).width + 28);
  roundRectPath(ctx, rightX, 48, rankPillW, 30, 8);
  ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
  ctx.fill();
  ctx.strokeStyle = theme.main;
  ctx.lineWidth = 1.25;
  ctx.stroke();
  ctx.fillStyle = theme.main;
  ctx.fillText(rankLabel, rightX + 14, 68);

  // Gifted pill (if > 0) or Secured pill on far right
  const giftedNum = parseInt(stats.gifted, 10) || 0;
  const statusText = giftedNum > 0 ? `GIFTED: ${giftedNum}` : "SECURED HIT";
  ctx.font = "bold 13px DejaVu Sans";
  const statusW = ctx.measureText(statusText).width + 38;
  const statusX = rightX + rightW - statusW;
  roundRectPath(ctx, statusX, 48, statusW, 30, 15);
  ctx.fillStyle = "rgba(16, 185, 129, 0.14)";
  ctx.fill();
  ctx.strokeStyle = "rgba(16, 185, 129, 0.45)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(statusX + 16, 63, 4, 0, Math.PI * 2);
  ctx.fillStyle = "#10B981";
  ctx.fill();
  ctx.fillStyle = "#A7F3D0";
  ctx.fillText(statusText, statusX + 26, 68);

  // Masked Username Title
  ctx.fillStyle = "#F8FAFC";
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = 10;
  drawFittedText(ctx, obscureUsername(username), rightX, 128, rightW, "DejaVu Sans", 34, 22);
  ctx.shadowBlur = 0;

  // Header divider
  const divGrad = ctx.createLinearGradient(rightX, 152, rightX + rightW, 152);
  divGrad.addColorStop(0, theme.main);
  divGrad.addColorStop(0.5, "rgba(255,255,255,0.16)");
  divGrad.addColorStop(1, "rgba(255,255,255,0.02)");
  ctx.fillStyle = divGrad;
  ctx.fillRect(rightX, 152, rightW, 2);

  /* ───────── 2x3 METRICS BENTO GRID ───────── */
  const metrics = [
    { label: "SKYBLOCK NETWORTH", value: formatCompact(stats.networth), accent: "#F59E0B" },
    { label: "SKYBLOCK LEVEL", value: `Lv. ${stats.sbLevel ?? 0}`, accent: "#38BDF8" },
    { label: "BEDWARS STARS", value: `${stats.bedwars ?? 0} Stars`, accent: "#FB7185" },
    { label: "NETWORK LEVEL", value: `Lv. ${stats.networkLevel ?? 0}`, accent: "#34D399" },
    { label: "DUELS KDR", value: formatKdr(stats.duelKDR), accent: "#A78BFA" },
    { label: "DUELS WINSTREAK", value: `${stats.duelWinstreak ?? 0} WS`, accent: "#FBBF24" }
  ];

  const gap = 18;
  const cardW = (rightW - gap) / 2;
  const cardH = 114;
  const gridStartY = 178;

  metrics.forEach((m, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const cx = rightX + col * (cardW + gap);
    const cy = gridStartY + row * (cardH + gap);

    ctx.save();
    roundRectPath(ctx, cx, cy, cardW, cardH, 16);
    ctx.fillStyle = "rgba(18, 22, 32, 0.82)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1.25;
    ctx.stroke();

    // Left colored accent pill
    roundRectPath(ctx, cx + 14, cy + 20, 4, cardH - 40, 2);
    ctx.fillStyle = m.accent;
    ctx.fill();

    // Label
    ctx.fillStyle = "rgba(203, 213, 225, 0.68)";
    ctx.font = "bold 12px DejaVu Sans";
    ctx.fillText(m.label, cx + 32, cy + 40);

    // Value
    ctx.fillStyle = "#FFFFFF";
    drawFittedText(ctx, String(m.value), cx + 32, cy + 84, cardW - 48, "Minecraftia", 24, 15);
    ctx.restore();
  });

  /* ───────── FOOTER BAR ───────── */
  const footerY = HEIGHT - 46;
  ctx.fillStyle = "rgba(148, 163, 184, 0.55)";
  ctx.font = "bold 12px DejaVu Sans";
  ctx.fillText("NOVA AUTOSECURE", rightX, footerY);

  const dateStr = new Date().toISOString().slice(0, 16).replace("T", " ") + " UTC";
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(148, 163, 184, 0.45)";
  ctx.font = "12px DejaVu Sans";
  ctx.fillText(dateStr, rightX + rightW, footerY);
  ctx.textAlign = "left";

  /* ───────── SAVE & RETURN ───────── */
  const buffer = canvas.toBuffer("image/png");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, buffer);

  console.log(`[makeCard] Image saved → ${outputPath}`);
  return buffer;
}

module.exports = { makeCard };
