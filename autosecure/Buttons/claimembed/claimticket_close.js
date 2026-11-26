const { PermissionsBitField } = require("discord.js");

module.exports = {
  name: "claimticket_close",
  callback: async (client, interaction) => {
    const [, buyerId] = interaction.customId.split("|");
    const isBuyer = interaction.user.id === buyerId;
    const isBotOwner = interaction.user.id === client.username;
    const isAdmin = interaction.memberPermissions?.has(PermissionsBitField.Flags.ManageChannels);

    if (!isBuyer && !isBotOwner && !isAdmin) {
      return interaction.reply({
        content: "Only the ticket creator, bot owner, or a server moderator can close this ticket.",
        ephemeral: true
      });
    }

    await interaction.reply({
      content: `Ticket closed by <@${interaction.user.id}>. Deleting channel in 3 seconds...`
    });

    setTimeout(() => {
      interaction.channel?.delete(`Claim ticket closed by ${interaction.user.tag}`).catch((err) => {
        console.error("[CLAIMTICKET_CLOSE] Failed to delete channel:", err);
      });
    }, 3000);
  }
};
