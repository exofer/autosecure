const { buildClaimEditorMessage } = require("../../utils/claimembed/claimEmbedHelper");

module.exports = {
  name: "claimembed_reset",
  sendembeds: true,
  callback: async (client, interaction) => {
    await Promise.all([
      client.queryParams(`DELETE FROM embeds WHERE user_id = ? AND type = ?`, [client.username, "claimembed"]),
      client.queryParams(`DELETE FROM buttons WHERE user_id = ? AND type = ?`, [client.username, "claimticket"])
    ]);

    const editorMsg = await buildClaimEditorMessage(client);
    return interaction.update(editorMsg);
  }
};
