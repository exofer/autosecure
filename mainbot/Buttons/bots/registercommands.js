const { join } = require("path");
const registcmds = require("../../utils/registerCommands");
const getLocalCmds = require('../../utils/getLocalCmds');
const { autosecureMap } = require("../../handlers/botHandler");
const { queryParams } = require("../../../db/database");
const { checkCooldown, startCooldown, acquireLock, releaseLock } = require("../../utils/cooldownGuard");

const REGISTER_COOLDOWN_MS = 60 * 1000;

module.exports = {
  name: "registercommands",
  editbot: true,
  callback: async (client, interaction) => {
    let lockKey = null;
    try {
      const [t, userId, botnumber] = interaction.customId.split("|");

      if (!userId || !botnumber) {
        return interaction.reply({ content: "Invalid bot reference.", ephemeral: true });
      }

      const botKey = `${userId}|${botnumber}`;
      const cooldown = checkCooldown(`regcmds:${botKey}`, REGISTER_COOLDOWN_MS);
      if (!cooldown.allowed) {
        return interaction.reply({
          content: `⏳ Please wait **${cooldown.retryAfterSec}s** before re-registering commands for this bot.`,
          ephemeral: true
        });
      }

      lockKey = `regcmds_lock:${botKey}`;
      if (!acquireLock(lockKey)) {
        return interaction.reply({
          content: "⏳ Command registration is already in progress for this bot.",
          ephemeral: true
        });
      }

      await interaction.deferUpdate();

      const check = await queryParams(
        'SELECT token FROM autosecure WHERE user_id = ? AND botnumber = ?', 
        [userId, botnumber]
      );

      if (!check || !check[0]?.token) {
        return interaction.editReply({ content: "Bot token not found in database, is this bot deleted?" });
      }

      const token = check[0].token;
      const botClient = autosecureMap.get(botKey);

      if (!botClient?.user?.id) {
        return interaction.editReply({ content: "Bot seems to be offline, please restart it first." });
      }

      const clientId = botClient.user.id;
      const commandsFiles = getLocalCmds(join(__dirname, "../../../autosecure/Commands"));

      const commands = commandsFiles
        .filter(cmd => cmd.name && cmd.description) 
        .map(cmd => {
          const { name, description, options } = cmd;
          const commandObj = { name, description };
          if (options?.length > 0) {
            commandObj.options = options;
          }
          return commandObj;
        });

      if (commands.length === 0) {
        return interaction.editReply({ content: "No valid commands found to register." });
      }

      await registcmds(clientId, commands, token);
      startCooldown(`regcmds:${botKey}`, REGISTER_COOLDOWN_MS);
      await interaction.editReply({
        content: "✅ Commands registered successfully! A 60-second cooldown is active to protect your bot from Discord rate limits."
      });
    } catch (error) {
      console.error("Error in registercommands:", error);
      await interaction.editReply({ 
        content: "❌ Failed to register commands. Please verify your bot token or try again shortly."
      }).catch(() => {});
    } finally {
      if (lockKey) releaseLock(lockKey);
    }
  }
};