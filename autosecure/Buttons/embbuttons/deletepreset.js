const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "deletepreset",
  callback: async (client, interaction) => {
    let [t, name] = interaction.customId.split("|");

    const embed = new EmbedBuilder().setTitle(`Preset ${name}`);
    const currentComponents = interaction.message.components;

    return interaction.update({
      content: `✅ Cleared out your embed so you can start over with editing it.`,
      embeds: [embed],
      components: currentComponents
    });
  }
};
