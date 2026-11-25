const accountsmsg = require('../../utils/accounts/accountsmsg');

module.exports = {
    name: "backtoaccounts",
    callback: async (client, interaction) => {
        let [t, id, current] = interaction.customId.split("|");
        if (id && id !== interaction.user.id) {
            return interaction.reply({ content: "You can only view your own accounts.", ephemeral: true });
        }
        return interaction.update(await accountsmsg(interaction.user.id, current));
    }
}