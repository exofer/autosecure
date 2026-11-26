const { ApplicationCommandOptionType, ChannelType } = require("discord.js");
const {
  getClaimEmbedConfig,
  saveClaimEmbedConfig,
  buildPublicClaimPayload,
  buildClaimEditorMessage
} = require("../../utils/claimembed/claimEmbedHelper");

module.exports = {
  name: "claimembed",
  description: "Post or customize your claim access ticket embed",
  sendembeds: true,
  options: [
    {
      name: "action",
      description: "Choose whether to post or customize the claim access embed",
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        { name: "Post Claim Access Embed", value: "post" },
        { name: "Customize Embed & Button", value: "customize" }
      ]
    },
    {
      name: "channel",
      description: "Target channel to post the embed in (defaults to current channel)",
      type: ApplicationCommandOptionType.Channel,
      channel_types: [ChannelType.GuildText, ChannelType.GuildAnnouncement],
      required: false
    },
    {
      name: "category",
      description: "Category where opened claim tickets should be created",
      type: ApplicationCommandOptionType.Channel,
      channel_types: [ChannelType.GuildCategory],
      required: false
    }
  ],
  callback: async (client, interaction) => {
    if (!interaction.guild) {
      return interaction.reply({
        content: "This command can only be used inside a server.",
        ephemeral: true
      });
    }

    const action = interaction.options.getString("action");
    const targetChannel = interaction.options.getChannel("channel") || interaction.channel;
    const categoryOption = interaction.options.getChannel("category");

    if (categoryOption) {
      const current = await getClaimEmbedConfig(client);
      await saveClaimEmbedConfig(client, current.embedData, {
        categoryId: categoryOption.id,
        ticketMessage: current.ticketMessage
      });
    }

    if (action === "customize") {
      const editorMsg = await buildClaimEditorMessage(client);
      return interaction.reply(editorMsg);
    }

    const config = await getClaimEmbedConfig(client);
    const payload = buildPublicClaimPayload(config);

    try {
      await targetChannel.send(payload);
      return interaction.reply({
        content: `Claim access embed posted in <#${targetChannel.id}>.`,
        ephemeral: true
      });
    } catch (err) {
      console.error("[CLAIMEMBED] Failed to post embed:", err);
      return interaction.reply({
        content: `Failed to post in <#${targetChannel.id}>. Check that the bot has **Send Messages** and **Embed Links** permissions there.`,
        ephemeral: true
      });
    }
  }
};
