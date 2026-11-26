const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");
const { getClaimEmbedConfig } = require("../../utils/claimembed/claimEmbedHelper");

module.exports = {
  name: "claimembed_edit",
  sendembeds: true,
  callback: async (client, interaction) => {
    const [, section] = interaction.customId.split("|");
    const config = await getClaimEmbedConfig(client);
    const { embedData, buttonData, categoryId, ticketMessage } = config;

    if (section === "core") {
      const modal = new ModalBuilder()
        .setCustomId("claimembed_modal|core")
        .setTitle("Edit Embed Title & Description");

      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("title")
            .setLabel("Embed Title")
            .setStyle(TextInputStyle.Short)
            .setMaxLength(256)
            .setRequired(true)
            .setValue(embedData.title || "")
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("description")
            .setLabel("Embed Description")
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(4000)
            .setRequired(true)
            .setValue(embedData.description || "")
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("footer")
            .setLabel("Footer Text (optional)")
            .setStyle(TextInputStyle.Short)
            .setMaxLength(256)
            .setRequired(false)
            .setValue(embedData.footer?.text || "")
        )
      );

      return interaction.showModal(modal);
    }

    if (section === "style") {
      const modal = new ModalBuilder()
        .setCustomId("claimembed_modal|style")
        .setTitle("Edit Embed Color & Images");

      const currentHex = `#${embedData.color.toString(16).padStart(6, "0").toUpperCase()}`;
      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("color")
            .setLabel("Hex Color (e.g. #F59E0B)")
            .setStyle(TextInputStyle.Short)
            .setMaxLength(7)
            .setRequired(false)
            .setValue(currentHex)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("thumbnail")
            .setLabel("Thumbnail Image URL (optional)")
            .setStyle(TextInputStyle.Short)
            .setMaxLength(500)
            .setRequired(false)
            .setValue(embedData.thumbnail?.url || "")
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("image")
            .setLabel("Banner Image URL (optional)")
            .setStyle(TextInputStyle.Short)
            .setMaxLength(500)
            .setRequired(false)
            .setValue(embedData.image?.url || "")
        )
      );

      return interaction.showModal(modal);
    }

    if (section === "btn") {
      const modal = new ModalBuilder()
        .setCustomId("claimembed_modal|btn")
        .setTitle("Edit Ticket Button");

      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("label")
            .setLabel("Button Label")
            .setStyle(TextInputStyle.Short)
            .setMaxLength(80)
            .setRequired(true)
            .setValue(buttonData.label || "Open Ticket")
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("emoji")
            .setLabel("Button Emoji (optional, e.g. 🎫)")
            .setStyle(TextInputStyle.Short)
            .setMaxLength(64)
            .setRequired(false)
            .setValue(buttonData.emoji || "")
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("style")
            .setLabel("Button Color: primary / secondary / success / danger")
            .setStyle(TextInputStyle.Short)
            .setMaxLength(16)
            .setRequired(false)
            .setValue(
              buttonData.style === 3 ? "success" :
              buttonData.style === 4 ? "danger" :
              buttonData.style === 2 ? "secondary" : "primary"
            )
        )
      );

      return interaction.showModal(modal);
    }

    if (section === "ticket") {
      const modal = new ModalBuilder()
        .setCustomId("claimembed_modal|ticket")
        .setTitle("Edit Claim Ticket Settings");

      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("categoryId")
            .setLabel("Ticket Category ID (optional)")
            .setStyle(TextInputStyle.Short)
            .setMaxLength(32)
            .setRequired(false)
            .setValue(categoryId || "")
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("ticketMessage")
            .setLabel("Welcome Message Inside Opened Ticket")
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(2000)
            .setRequired(false)
            .setValue(ticketMessage || "")
        )
      );

      return interaction.showModal(modal);
    }
  }
};
