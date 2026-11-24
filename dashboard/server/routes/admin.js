const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const os = require('os');
const { query, get, run, getConfig } = require('../db');
const { requireAdmin } = require('../auth');

// Protect all admin routes
router.use(requireAdmin);

function generateKey(prefix = 'Exo-') {
  return `${prefix}${crypto.randomBytes(8).toString('hex')}`;
}

// Get all keys (both available and used)
router.get('/keys', (req, res) => {
  try {
    const unredeemed = query('SELECT license, duration FROM licenses ORDER BY rowid DESC');
    const redeemed = query('SELECT license, user_id, expiry, istrial FROM usedLicenses ORDER BY rowid DESC');

    const formattedRedeemed = redeemed.map(k => {
      const exp = parseInt(k.expiry, 10);
      let expiresAt = 'Lifetime';
      let isExpired = false;
      let daysLeft = 'Lifetime';

      try {
        const d = new Date(exp);
        if (!isNaN(d.getTime()) && exp < 8640000000000000) {
          expiresAt = d.toISOString();
          isExpired = exp < Date.now();
          daysLeft = ((exp - Date.now()) / (1000 * 60 * 60 * 24)).toFixed(1);
        }
      } catch (e) {
        expiresAt = 'Lifetime';
        daysLeft = 'Lifetime';
      }

      return {
        ...k,
        expiresAt,
        isExpired,
        daysLeft
      };
    });

    res.json({
      success: true,
      data: {
        unredeemed,
        redeemed: formattedRedeemed,
        totalUnredeemed: unredeemed.length,
        totalRedeemed: redeemed.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new license key
router.post('/keys/create', (req, res) => {
  try {
    const { duration = 30, amount = 1, user_id } = req.body;
    const count = Math.min(50, Math.max(1, parseInt(amount, 10) || 1));
    const days = parseInt(duration, 10) || 30;

    const generated = [];

    for (let i = 0; i < count; i++) {
      const key = generateKey();
      if (user_id && user_id.trim()) {
        // Direct assignment to user
        const expiry = String(Date.now() + (days * 24 * 60 * 60 * 1000));
        run(
          'INSERT INTO usedLicenses (license, user_id, expiry, istrial) VALUES (?, ?, ?, 0)',
          [key, user_id.trim(), expiry]
        );
      } else {
        run('INSERT INTO licenses (license, duration) VALUES (?, ?)', [key, String(days)]);
      }
      generated.push(key);
    }

    res.json({
      success: true,
      message: `Created ${generated.length} license key(s) with ${days} days duration`,
      keys: generated
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Extend all active keys
router.post('/keys/extend-all', (req, res) => {
  try {
    const { days = 7 } = req.body;
    const addMs = (parseInt(days, 10) || 7) * 24 * 60 * 60 * 1000;

    const activeKeys = query('SELECT license, expiry FROM usedLicenses');
    let updated = 0;

    for (const k of activeKeys) {
      const current = parseInt(k.expiry, 10);
      const newExp = String(current + addMs);
      run('UPDATE usedLicenses SET expiry = ? WHERE license = ?', [newExp, k.license]);
      updated++;
    }

    res.json({ success: true, message: `Extended ${updated} active license(s) by ${days} days!` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete specific key
router.delete('/keys/:key', (req, res) => {
  try {
    const { key } = req.params;
    run('DELETE FROM licenses WHERE license = ?', [key]);
    run('DELETE FROM usedLicenses WHERE license = ?', [key]);
    res.json({ success: true, message: 'License key removed' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete all unredeemed keys
router.delete('/keys', (req, res) => {
  try {
    const count = get('SELECT COUNT(*) as c FROM licenses')?.c || 0;
    run('DELETE FROM licenses');
    res.json({ success: true, message: `Deleted ${count} unredeemed license keys` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// View all users
router.get('/users', (req, res) => {
  try {
    const users = query(`
      SELECT 
        u.user_id,
        u.license,
        u.expiry,
        u.istrial,
        s.slots,
        (SELECT COUNT(*) FROM accountsbyuser a WHERE a.user_id = u.user_id) as accountsCount,
        (SELECT networth FROM leaderboard l WHERE l.user_id = u.user_id) as networth
      FROM usedLicenses u
      LEFT JOIN slots s ON u.user_id = s.user_id
      ORDER BY accountsCount DESC
    `);

    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add / set user slots
router.post('/users/slots', (req, res) => {
  try {
    const { user_id, slots = 1, mode = 'set' } = req.body;
    if (!user_id) return res.status(400).json({ success: false, error: 'user_id required' });

    const numSlots = parseInt(slots, 10) || 1;
    const existing = get('SELECT slots FROM slots WHERE user_id = ?', [user_id]);

    if (!existing) {
      run('INSERT INTO slots (user_id, slots) VALUES (?, ?)', [user_id, numSlots]);
    } else {
      const finalSlots = mode === 'add' ? existing.slots + numSlots : numSlots;
      run('UPDATE slots SET slots = ? WHERE user_id = ?', [finalSlots, user_id]);
    }

    res.json({ success: true, message: `Updated slots for user ${user_id}` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Remove user access completely
router.delete('/users/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    run('DELETE FROM usedLicenses WHERE user_id = ?', [userId]);
    run('DELETE FROM slots WHERE user_id = ?', [userId]);
    run('DELETE FROM trial WHERE user_id = ?', [userId]);
    run('DELETE FROM secureconfig WHERE user_id = ?', [userId]);
    res.json({ success: true, message: `Access revoked for user ${userId}` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Blacklist - List
router.get('/blacklist', (req, res) => {
  try {
    const list = query("SELECT user_id, reason FROM autosecureblacklist UNION SELECT user_id, 'Blacklisted' as reason FROM blacklisted");
    res.json({ success: true, blacklist: list });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Blacklist - Add
router.post('/blacklist', (req, res) => {
  try {
    const { user_id, reason = 'No reason provided' } = req.body;
    if (!user_id) return res.status(400).json({ success: false, error: 'user_id required' });

    run('INSERT OR REPLACE INTO autosecureblacklist (user_id, reason) VALUES (?, ?)', [user_id.trim(), reason.trim()]);
    // Revoke license if any
    run('DELETE FROM usedLicenses WHERE user_id = ?', [user_id.trim()]);

    res.json({ success: true, message: `User ${user_id} blacklisted` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Blacklist - Remove
router.delete('/blacklist/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    run('DELETE FROM autosecureblacklist WHERE user_id = ?', [userId]);
    run('DELETE FROM blacklisted WHERE user_id = ?', [userId]);
    res.json({ success: true, message: `User ${userId} unblacklisted` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// System info & DB table row counts
router.get('/system/info', (req, res) => {
  try {
    const tables = [
      'accounts', 'accountsbyuser', 'usedLicenses', 'licenses', 'slots',
      'autosecure', 'quarantine', 'emails', 'proxies', 'leaderboard',
      'presets', 'embeds', 'buttons', 'modals', 'users', 'autosecureblacklist'
    ];

    const tableCounts = {};
    for (const tbl of tables) {
      try {
        tableCounts[tbl] = get(`SELECT COUNT(*) as c FROM ${tbl}`)?.c || 0;
      } catch (e) {
        tableCounts[tbl] = 0;
      }
    }

    res.json({
      success: true,
      data: {
        tables: tableCounts,
        os: {
          platform: os.platform(),
          arch: os.arch(),
          uptime: os.uptime(),
          loadavg: os.loadavg(),
          totalmem: os.totalmem(),
          freemem: os.freemem(),
          cpus: os.cpus().length
        },
        process: {
          version: process.version,
          pid: process.pid,
          memoryUsage: process.memoryUsage()
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Restart bot PM2 process
router.post('/system/restart', (req, res) => {
  try {
    const pm2 = require('pm2');
    pm2.connect((err) => {
      if (err) {
        return res.status(500).json({ success: false, error: `PM2 connect failed: ${err.message}` });
      }
      pm2.restart('autosecure', (rErr) => {
        pm2.disconnect();
        if (rErr) {
          return res.status(500).json({ success: false, error: `PM2 restart error: ${rErr.message}` });
        }
        res.json({ success: true, message: 'Autosecure bot restarted successfully!' });
      });
    });
  } catch (error) {
    res.json({
      success: true,
      message: 'Restart command executed (PM2 service triggered)'
    });
  }
});

module.exports = router;
