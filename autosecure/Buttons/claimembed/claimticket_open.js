const {
  ChannelType,
  PermissionsBitField,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");
const { getClaimEmbedConfig } = require("../../utils/claimembed/claimEmbedHelper");

module.exports = {
  name: "claimticket_open",
  callback: async (client, interaction) => {
    if (!interaction.guild) {
      return interaction.reply({ content: "Tickets can only be opened inside a server.", ephemeral: true });
    }

    const guild = interaction.guild;
    const buyerId = interaction.user.id;
    const ownerId = client.username;
    const topicMarker = `claimticket:${buyerId}`;

    // Check if the buyer already has an open claim ticket in this server
    const existingChannel = guild.channels.cache.find(
      (ch) => ch.type === ChannelType.GuildText && ch.topic && ch.topic.includes(topicMarker)
    );

    if (existingChannel) {
      return interaction.reply({
        content: `You already have an open claim access ticket: <#${existingChannel.id}>`,
        ephemeral: true
      });
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      const config = await getClaimEmbedConfig(client);
      let parentCategoryId = null;

      if (config.categoryId) {
        const cat = guild.channels.cache.get(config.categoryId);
        if (cat && cat.type === ChannelType.GuildCategory) {
          parentCategoryId = cat.id;
        }
      } else if (interaction.channel?.parentId) {
        parentCategoryId = interaction.channel.parentId;
      }

      const safeUsername = interaction.user.username.toLowerCase().replace(/[^a-z0-9-_]/g, "").slice(0, 20) || "user";
      const channelName = `claim-${safeUsername}`;

      const permissionOverwrites = [
        {
          id: guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: buyerId,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.AttachFiles,
            PermissionsBitField.Flags.ReadMessageHistory
          ]
        },
        {
          id: client.user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ManageChannels,
            PermissionsBitField.Flags.ReadMessageHistory
          ]
        }
      ];

      if (ownerId && ownerId !== buyerId) {
        permissionOverwrites.push({
          id: ownerId,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ManageMessages,
            PermissionsBitField.Flags.ReadMessageHistory
          ]
        });
      }

      const ticketChannel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: parentCategoryId,
        topic: `${topicMarker} | Claim Access Ticket for @${interaction.user.username}`,
        permissionOverwrites
      });

      const welcomeEmbed = new EmbedBuilder()
        .setTitle("Claim Access Ticket")
        .setColor(0xf59e0b)
        .setDescription(config.ticketMessage)
        .addFields(
          { name: "Buyer", value: `<@${buyerId}>`, inline: true },
          { name: "Bot Owner", value: `<@${ownerId}>`, inline: true }
        )
        .setFooter({ text: "Nova AutoSecure" })
        .setTimestamp();

      const closeRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`claimticket_close|${buyerId}`)
          .setLabel("Close Ticket")
          .setStyle(ButtonStyle.Danger)
      );

      await ticketChannel.send({
        content: `<@${buyerId}> <@${ownerId}>`,
        embeds: [welcomeEmbed],
        components: [closeRow]
      });

      return interaction.editReply({
        content: `Your claim access ticket has been created: <#${ticketChannel.id}>`
      });
    } catch (err) {
      console.error("[CLAIMTICKET_OPEN] Failed to create ticket channel:", err);
      return interaction.editReply({
        content: "Failed to open a ticket. Make sure the bot has the **Manage Channels** permission in this server."
      });
    }
  }
};
