const { ButtonStyle } = require("discord.js");
const {
  DEFAULT_TICKET_MESSAGE,
  parseHexColor,
  isValidHttpUrl,
  getClaimEmbedConfig,
  saveClaimEmbedConfig,
  saveClaimButtonConfig,
  buildClaimEditorMessage
} = require("../../utils/claimembed/claimEmbedHelper");

module.exports = {
  name: "claimembed_modal",
  sendembeds: true,
  callback: async (client, interaction) => {
    const [, section] = interaction.customId.split("|");
    const config = await getClaimEmbedConfig(client);
    const nextEmbed = { ...config.embedData };
    let nextCategoryId = config.categoryId;
    let nextTicketMessage = config.ticketMessage;

    if (section === "core") {
      const title = interaction.fields.getTextInputValue("title").trim();
      const description = interaction.fields.getTextInputValue("description").trim();
      const footerText = interaction.fields.getTextInputValue("footer").trim();

      if (title) nextEmbed.title = title;
      if (description) nextEmbed.description = description;
      if (footerText) {
        nextEmbed.footer = { text: footerText };
      } else {
        delete nextEmbed.footer;
      }

      await saveClaimEmbedConfig(client, nextEmbed, {
        categoryId: nextCategoryId,
        ticketMessage: nextTicketMessage
      });
    } else if (section === "style") {
      const colorInput = interaction.fields.getTextInputValue("color").trim();
      const thumbInput = interaction.fields.getTextInputValue("thumbnail").trim();
      const imageInput = interaction.fields.getTextInputValue("image").trim();

      if (colorInput) {
        nextEmbed.color = parseHexColor(colorInput, nextEmbed.color);
      }

      if (thumbInput && isValidHttpUrl(thumbInput)) {
        nextEmbed.thumbnail = { url: thumbInput };
      } else if (!thumbInput) {
        delete nextEmbed.thumbnail;
      }

      if (imageInput && isValidHttpUrl(imageInput)) {
        nextEmbed.image = { url: imageInput };
      } else if (!imageInput) {
        delete nextEmbed.image;
      }

      await saveClaimEmbedConfig(client, nextEmbed, {
        categoryId: nextCategoryId,
        ticketMessage: nextTicketMessage
      });
    } else if (section === "btn") {
      const label = interaction.fields.getTextInputValue("label").trim();
      const emoji = interaction.fields.getTextInputValue("emoji").trim();
      const styleRaw = interaction.fields.getTextInputValue("style").trim().toLowerCase();

      const styleMap = {
        primary: ButtonStyle.Primary,
        blurple: ButtonStyle.Primary,
        secondary: ButtonStyle.Secondary,
        grey: ButtonStyle.Secondary,
        gray: ButtonStyle.Secondary,
        success: ButtonStyle.Success,
        green: ButtonStyle.Success,
        danger: ButtonStyle.Danger,
        red: ButtonStyle.Danger
      };

      const nextButton = {
        label: label || config.buttonData.label,
        emoji: emoji || "",
        style: styleMap[styleRaw] || config.buttonData.style || ButtonStyle.Primary
      };

      await saveClaimButtonConfig(client, nextButton);
    } else if (section === "ticket") {
      const catInput = interaction.fields.getTextInputValue("categoryId").trim();
      const msgInput = interaction.fields.getTextInputValue("ticketMessage").trim();

      nextCategoryId = /^\d{15,22}$/.test(catInput) ? catInput : null;
      nextTicketMessage = msgInput || DEFAULT_TICKET_MESSAGE;

      await saveClaimEmbedConfig(client, nextEmbed, {
        categoryId: nextCategoryId,
        ticketMessage: nextTicketMessage
      });
    }

    const editorMsg = await buildClaimEditorMessage(client);
    return interaction.update(editorMsg);
  }
};
