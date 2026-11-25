const discord = require("discord.js");
const eventHandler = require("./Handlers/eventHandler");
const { queryParams } = require("../db/database.js");
const { ActivityType } = require("discord.js");
const { tablesbotnumber } = require("../db/gettablesarray.js")
const { injectBotNumber } = require("../db/injectBotNumber.js");

module.exports = async (token, username, d = 1, dmmode = false) => {
try {
    const clientOptions = {
      intents: [
        discord.GatewayIntentBits.Guilds,
        ...(dmmode ? [
          discord.GatewayIntentBits.DirectMessages,
          discord.GatewayIntentBits.MessageContent,
          discord.GatewayIntentBits.GuildMessages
        ] : [])
      ],
      partials: dmmode ? [
        discord.Partials.Channel 
      ] : []
    };

    /*
    Initialize Client with new botnumber
    */
    const client = new discord.Client(clientOptions);
    client.username = username;
    client.botnumber = d; 
    client.isuserbot = true;



/*
    Multiple botfix (safely scopes queries to the bot's botnumber slot)
*/

client.queryParams = async (query, params = [], method = "all") => {
  const allowed = tablesbotnumber();
  const scoped = injectBotNumber(query, params, client.botnumber, allowed);

  try {
    const result = await queryParams(scoped.query, scoped.params, method);
    return result;
  } catch (error) {
    console.error(`[Bot ${client.botnumber}] Query error:`, error);
    throw error;
  }
};

    let activityData = await client.queryParams("SELECT * FROM autosecure WHERE user_id = ?", [username]);
    activityData = activityData.length > 0 ? JSON.parse(activityData[0].activity) : null;

    if (activityData) {

      const activityMap = {
        "Playing": ActivityType.Playing,
        "Streaming": ActivityType.Streaming,
        "Competing": ActivityType.Competing,
        "Listening": ActivityType.Listening,
        "Watching": ActivityType.Watching,
      };

      client.once("ready", async () => {
        try {
          const selectedActivity = activityData?.activity ? activityMap[activityData.activity] : null;
          const activityName = activityData?.activityData || null;
          const visibility = activityData?.visibility || 'online';

     //     console.log(`Setting: ${activityData?.visibility}`)
          
          if (selectedActivity && activityName) {
            await client.user.setPresence({
              activities: [{
                name: activityName,
                type: selectedActivity,
              }],
              status: visibility
            });
          } else {
            await client.user.setPresence({
              status: visibility,
              activities: [] 
            });
          }
      //    console.log(`[Bot ${client.botnumber}] Presence updated successfully`);
        } catch (error) {
          console.error(`[Bot ${client.botnumber}] Error setting presence:`, error);
        }
      });
    }

    eventHandler(client, token);
    await client.login(token);
    return client;
} catch (e) {
  if (String(e).includes("[TokenInvalid]")) {
    console.log("Invalid token");
    return;
  }
  console.error("Initialization error:", e);
  return false;
}

};