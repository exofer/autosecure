const usersMsg = require("../../utils/usersMsg");
module.exports = {
    name: "users",
    description: 'Users panel',
    enabled: true,
    ownerOnly: true,
    callback: async (client, interaction) => {
        interaction.reply(await usersMsg(interaction.user.id,1))
    }
}
