const { getClaimEmbedConfig, buildPublicClaimPayload } = require("../../utils/claimembed/claimEmbedHelper");

module.exports = {
  name: "claimembed_post",
  sendembeds: true,
  callback: async (client, interaction) => {
    if (!interaction.guild || !interaction.channel) {
      return interaction.reply({ content: "This button can only be used inside a server channel.", ephemeral: true });
    }

    const config = await getClaimEmbedConfig(client);
    const payload = buildPublicClaimPayload(config);

    try {
      await interaction.channel.send(payload);
      return interaction.reply({
        content: `Claim access embed posted in <#${interaction.channel.id}>.`,
        ephemeral: true
      });
    } catch (err) {
      console.error("[CLAIMEMBED_POST] Error posting:", err);
      return interaction.reply({
        content: "Failed to post embed here. Make sure the bot has **Send Messages** and **Embed Links** permissions.",
        ephemeral: true
      });
    }
  }
};
