const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const DEFAULT_CLAIM_EMBED = {
  title: "Buy Claim Access",
  description:
    "Open a ticket below to purchase **claim access** for this bot.\n\n" +
    "**What you get:**\n" +
    "• Automated hit claiming & split support\n" +
    "• Instant DM delivery & stats overview\n" +
    "• Dedicated support from the bot owner\n\n" +
    "Click the button below to open a private ticket.",
  color: 0xf59e0b,
  footer: { text: "Nova AutoSecure" }
};

const DEFAULT_CLAIM_BUTTON = {
  label: "Open Ticket",
  emoji: "🎫",
  style: ButtonStyle.Primary
};

const DEFAULT_TICKET_MESSAGE =
  "Thank you for opening a claim access ticket! Please share your budget, preferred split/plan, and any questions while the bot owner assists you.";

function parseHexColor(input, fallback = 0xf59e0b) {
  if (typeof input === "number" && !Number.isNaN(input)) return input;
  if (!input || typeof input !== "string") return fallback;
  const cleaned = input.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(cleaned)) return fallback;
  return parseInt(cleaned, 16);
}

function isValidHttpUrl(url) {
  if (!url || typeof url !== "string") return false;
  try {
    const u = new URL(url.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

async function getClaimEmbedConfig(client) {
  const ownerId = client.username;
  const [embedRows, buttonRows] = await Promise.all([
    client.queryParams(`SELECT embed FROM embeds WHERE user_id = ? AND type = ?`, [ownerId, "claimembed"]),
    client.queryParams(`SELECT button FROM buttons WHERE user_id = ? AND type = ?`, [ownerId, "claimticket"])
  ]);

  let storedEmbed = {};
  if (embedRows.length > 0 && embedRows[0].embed) {
    try {
      storedEmbed = JSON.parse(embedRows[0].embed);
    } catch {
      storedEmbed = {};
    }
  }

  let storedButton = {};
  if (buttonRows.length > 0 && buttonRows[0].button) {
    try {
      storedButton = JSON.parse(buttonRows[0].button);
    } catch {
      storedButton = {};
    }
  }

  const embedData = {
    title: storedEmbed.title || DEFAULT_CLAIM_EMBED.title,
    description: storedEmbed.description || DEFAULT_CLAIM_EMBED.description,
    color: parseHexColor(storedEmbed.color, DEFAULT_CLAIM_EMBED.color),
    footer: storedEmbed.footer?.text ? { text: storedEmbed.footer.text } : { ...DEFAULT_CLAIM_EMBED.footer },
    ...(isValidHttpUrl(storedEmbed.thumbnail?.url) ? { thumbnail: { url: storedEmbed.thumbnail.url } } : {}),
    ...(isValidHttpUrl(storedEmbed.image?.url) ? { image: { url: storedEmbed.image.url } } : {})
  };

  const buttonData = {
    label: storedButton.label || DEFAULT_CLAIM_BUTTON.label,
    emoji: storedButton.emoji !== undefined ? storedButton.emoji : DEFAULT_CLAIM_BUTTON.emoji,
    style: Number(storedButton.style) || DEFAULT_CLAIM_BUTTON.style
  };

  return {
    embedData,
    buttonData,
    categoryId: storedEmbed._categoryId || null,
    ticketMessage: storedEmbed._ticketMessage || DEFAULT_TICKET_MESSAGE
  };
}

async function saveClaimEmbedConfig(client, embedData, meta = {}) {
  const ownerId = client.username;
  const payload = JSON.stringify({
    ...embedData,
    _categoryId: meta.categoryId || null,
    _ticketMessage: meta.ticketMessage || DEFAULT_TICKET_MESSAGE
  });

  const existing = await client.queryParams(
    `SELECT id FROM embeds WHERE user_id = ? AND type = ?`,
    [ownerId, "claimembed"]
  );

  if (existing.length > 0) {
    await client.queryParams(
      `UPDATE embeds SET embed = ? WHERE user_id = ? AND type = ?`,
      [payload, ownerId, "claimembed"]
    );
  } else {
    await client.queryParams(
      `INSERT INTO embeds (user_id, type, embed) VALUES (?, ?, ?)`,
      [ownerId, "claimembed", payload]
    );
  }
}

async function saveClaimButtonConfig(client, buttonData) {
  const ownerId = client.username;
  const payload = JSON.stringify(buttonData);

  const existing = await client.queryParams(
    `SELECT id FROM buttons WHERE user_id = ? AND type = ?`,
    [ownerId, "claimticket"]
  );

  if (existing.length > 0) {
    await client.queryParams(
      `UPDATE buttons SET button = ? WHERE user_id = ? AND type = ?`,
      [payload, ownerId, "claimticket"]
    );
  } else {
    await client.queryParams(
      `INSERT INTO buttons (user_id, type, button) VALUES (?, ?, ?)`,
      [ownerId, "claimticket", payload]
    );
  }
}

function buildPublicClaimPayload(config) {
  const embed = EmbedBuilder.from(config.embedData);

  const openBtn = new ButtonBuilder()
    .setCustomId("claimticket_open")
    .setLabel(config.buttonData.label.slice(0, 80))
    .setStyle(config.buttonData.style || ButtonStyle.Primary);

  if (config.buttonData.emoji && String(config.buttonData.emoji).trim()) {
    try {
      openBtn.setEmoji(String(config.buttonData.emoji).trim());
    } catch {
      // Ignore invalid emoji strings
    }
  }

  return {
    embeds: [embed],
    components: [new ActionRowBuilder().addComponents(openBtn)]
  };
}

async function buildClaimEditorMessage(client) {
  const config = await getClaimEmbedConfig(client);
  const previewEmbed = EmbedBuilder.from(config.embedData);

  const colorHex = `#${config.embedData.color.toString(16).padStart(6, "0").toUpperCase()}`;
  const styleNames = {
    [ButtonStyle.Primary]: "Blurple (Primary)",
    [ButtonStyle.Secondary]: "Grey (Secondary)",
    [ButtonStyle.Success]: "Green (Success)",
    [ButtonStyle.Danger]: "Red (Danger)"
  };

  const settingsSummary = new EmbedBuilder()
    .setTitle("Claim Access Embed Customizer")
    .setColor(0xf59e0b)
    .setDescription("Customize the embed above, then post it to any channel using **Post Here** or `/claimembed action:Post`.")
    .addFields(
      { name: "Color", value: `\`${colorHex}\``, inline: true },
      { name: "Button", value: `${config.buttonData.emoji ? config.buttonData.emoji + " " : ""}\`${config.buttonData.label}\` (${styleNames[config.buttonData.style] || "Primary"})`, inline: true },
      { name: "Ticket Category", value: config.categoryId ? `<#${config.categoryId}> (\`${config.categoryId}\`)` : "`Auto / Current Category`", inline: true }
    );

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("claimembed_edit|core")
      .setLabel("Edit Title & Desc")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId("claimembed_edit|style")
      .setLabel("Color & Images")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("claimembed_edit|btn")
      .setLabel("Edit Button")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("claimembed_edit|ticket")
      .setLabel("Ticket Settings")
      .setStyle(ButtonStyle.Secondary)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("claimembed_post")
      .setLabel("Post Here")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("claimembed_reset")
      .setLabel("Reset Default")
      .setStyle(ButtonStyle.Danger)
  );

  return {
    embeds: [previewEmbed, settingsSummary],
    components: [row1, row2],
    ephemeral: true
  };
}

module.exports = {
  DEFAULT_CLAIM_EMBED,
  DEFAULT_CLAIM_BUTTON,
  DEFAULT_TICKET_MESSAGE,
  parseHexColor,
  isValidHttpUrl,
  getClaimEmbedConfig,
  saveClaimEmbedConfig,
  saveClaimButtonConfig,
  buildPublicClaimPayload,
  buildClaimEditorMessage
};
