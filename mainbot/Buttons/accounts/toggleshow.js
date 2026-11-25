const accountsmsg = require("../../../autosecure/utils/accounts/accountsmsg");
const { queryParams } = require("../../../db/database");

module.exports = {
    name: "togglenonmc",
    callback: async (client, interaction) => {
        const [t, userId] = interaction.customId.split("|");
        if (userId && userId !== interaction.user.id) {
            return interaction.reply({ content: "You can only update your own account filters.", ephemeral: true });
        }
        const ownerId = interaction.user.id;

        const settingsQuery = await queryParams(
            `SELECT hidenonmc FROM settings WHERE user_id=?`,
            [ownerId]
        );

        const currentSetting = settingsQuery[0]?.hidenonmc === 1;
        const newSetting = !currentSetting ? 1 : 0;

        if (settingsQuery.length > 0) {
            await queryParams(
                `UPDATE settings SET hidenonmc=? WHERE user_id=?`,
                [newSetting, ownerId]
            );
        } else {
            await queryParams(
                `INSERT INTO settings (user_id, hidenonmc) VALUES (?, ?)`,
                [ownerId, newSetting]
            );
        }

        return interaction.update(await accountsmsg(ownerId, 1));
    }
};