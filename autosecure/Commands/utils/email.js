const { ApplicationCommandOptionType } = require("discord.js");
const validEmail = require("../../utils/validEmail");
const { domains } = require("../../../config.json");
const emailMsg = require("../../utils/emailMsg");

module.exports = {
    name: "email",
    description: 'Read your emails!',
    options: [
        {
            name: "inbox",
            description: "Inbox to open",
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],
    userOnly: true,
    callback: async (client, interaction) => {
        let email = interaction.options.getString("inbox");
        
        // Validate the email
        if (!validEmail(email)) {
            return interaction.reply({
                embeds: [{
                    title: `Error :x:`,
                    description: `Invalid Email.`,
                    color: 0xff0000
                }],
                ephemeral: true
            });
        }

        // Check for unsupported domains
        if (!domains.includes(email.split("@")[1])) {
            return interaction.reply({
                embeds: [{
                    title: `Error :x:`,
                    description: `Unsupported domain.`,
                    color: 0xff0000
                }],
                ephemeral: true
            });
        }

        // Get the email message
        const msg = await emailMsg(email, interaction.user.id, 1);

        // Reply with the embed and buttons
        return interaction.reply({
            embeds: [msg.embeds[0]], // Use the embed from the response
            components: msg.components, // Include the buttons
            ephemeral: true
        });
    }
};
