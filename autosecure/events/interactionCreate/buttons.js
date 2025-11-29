const getButtons = require("../../utils/getButtons");
const { queryParams } = require("../../../db/db");
const cliColor = require('cli-color');
const jsotp = require('jsotp'); 
const emailMsg = require("../../utils/emailMsg"); 
const { EmbedBuilder } = require("discord.js");
const fetchStatsSkycrypt = require("../../utils/fetchStatsSkycrypt"); 
const fetchStats = require("../../utils/fetchStats"); 
const statsMsg = require("../../utils/statsMsg"); 
module.exports = async (client, interaction) => {
  try {
    if (!interaction.isButton()) {
      return;
    }
    const Buttons = getButtons(__dirname);
    if (interaction.customId.startsWith("email|")) {
      const securityEmail = interaction.customId.split("|")[1];
      const emailContent = await emailMsg(securityEmail, interaction.user.id, 1);
      return interaction.reply(emailContent);
    }
    if (interaction.customId.startsWith("skyblock|")) {
      const username = interaction.customId.split("|")[1];
      if (!username) {
        return interaction.reply({ content: 'Username not found for Skyblock stats.', ephemeral: true });
      }
      try {
        await fetchStatsSkycrypt(username);
        const summaryMsg = await statsMsg(interaction.user.id, "skyblock");
        return interaction.reply(summaryMsg); 
      } catch (err) {
        console.log('Error fetching Skyblock stats:', err);
        return interaction.reply({ content: 'Error fetching Skyblock stats.', ephemeral: true });
      }
    }
    if (interaction.customId.startsWith("bedwars|")) {
      const username = interaction.customId.split("|")[1];
      if (!username) {
        return interaction.reply({ content: 'Username not found for Bedwars stats.', ephemeral: true });
      }
      try {
        const bedwarsStatsId = await fetchStats(username);
        const summaryMsg = await statsMsg(bedwarsStatsId, "bedwars");
        return interaction.reply(summaryMsg); 
      } catch (err) {
        console.log('Error fetching Bedwars stats:', err);
        return interaction.reply({ content: 'Error fetching Bedwars stats.', ephemeral: true });
      }
    }
    let button = Buttons.find((button) => button.name === interaction.customId.split("|")[0]);
    if (interaction.customId.split("|")[0] === "action") {
      let action = await queryParams(`SELECT * FROM actions WHERE id=?`, [
        interaction.customId.split("|")[1],
      ]);
      if (action.length === 0) {
        return interaction.reply({
          embeds: [
            {
              title: `Error :x:`,
              description: `Please try again later.`,
              color: 0xff0000,
            },
          ],
          ephemeral: true,
        });
      }
      interaction.customId = action[0].action;
      button = Buttons.find((button) => button.name === interaction.customId.split("|")[0]);
    }
    if (!button) return;
    if (button.ownerOnly) {
      if (interaction.user.id !== client.username) {
        return interaction.reply({ content: `Invalid permissions.`, ephemeral: true });
      }
    }
    if (button.adminOnly) {
      let users = await queryParams(`SELECT * FROM users WHERE user_id=? AND child=?`, [client.username, interaction.user.id]);
      if ((users.length === 0 || !users[0]?.admin) && client.username !== interaction.user.id) {
        return interaction.reply({ content: `Invalid permissions.`, ephemeral: true });
      }
    }
    if (button.userOnly) {
      let users = await queryParams(`SELECT * FROM users WHERE user_id=? AND child=?`, [client.username, interaction.user.id]);
      if (users.length === 0 && client.username !== interaction.user.id) {
        return interaction.reply({ content: `You don't have access to this bot.`, ephemeral: true });
      }
    }
    console.log(`B]${cliColor.yellow(button.name)} ${cliColor.blue(interaction.user.username)} ${cliColor.red(interaction.customId)}`);
    await button.callback(client, interaction);
  } catch (e) {
    console.log(e);
    return interaction.reply({ content: "Something went wrong.", ephemeral: true });
  }
};