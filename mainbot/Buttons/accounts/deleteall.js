const { queryParams } = require("../../../db/database");
const accountsmsg = require("../../../autosecure/utils/accounts/accountsmsg");

module.exports = {
    name: "deleteaccounts",
    callback: async (client, interaction) => {
        let [t, id, current] = interaction.customId.split("|");
        if (id && id !== interaction.user.id) {
            return interaction.reply({ content: "You can only delete your own accounts.", ephemeral: true });
        }
        const ownerId = interaction.user.id;

        await queryParams(`DELETE FROM status WHERE uid IN (SELECT uid FROM accounts WHERE user_id=?)`, [ownerId]);
        await queryParams(`DELETE FROM extrainformation WHERE user_id=?`, [ownerId]);
        await queryParams(`DELETE FROM accounts WHERE user_id=?`, [ownerId]);
        await queryParams(`DELETE FROM accountsbyuser WHERE user_id=?`, [ownerId]);

        current = 1;

        return interaction.update(await accountsmsg(ownerId, current));
    }
};