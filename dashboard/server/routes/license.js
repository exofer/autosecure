const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { query, get, run, getConfig } = require('../db');

function generateKey(prefix = 'Exo-') {
  return `${prefix}${crypto.randomBytes(8).toString('hex')}`;
}

// Get license status
router.get('/', (req, res) => {
  try {
    const userId = req.user.id;
    const isUserOwner = req.user.isAdmin;

    const licenseInfo = get('SELECT * FROM usedLicenses WHERE user_id = ?', [userId]);
    const slotsRow = get('SELECT slots FROM slots WHERE user_id = ?', [userId]);
    const lbRow = get('SELECT networth, amount FROM leaderboard WHERE user_id = ?', [userId]);

    const botSlots = slotsRow?.slots || 1;
    const securedCount = lbRow?.amount || 0;
    const totalNetworth = lbRow?.networth || 0;

    let expiresAt = null;
    let isExpired = false;
    let daysRemaining = null;

    if (licenseInfo?.expiry) {
      try {
        const expEpoch = parseInt(licenseInfo.expiry, 10);
        const d = new Date(expEpoch);
        if (!isNaN(d.getTime()) && expEpoch < 8640000000000000) {
          expiresAt = d.toISOString();
          const diffMs = expEpoch - Date.now();
          isExpired = diffMs <= 0;
          daysRemaining = (diffMs / (1000 * 60 * 60 * 24)).toFixed(1);
        } else {
          expiresAt = 'Lifetime';
          daysRemaining = 'Lifetime';
        }
      } catch (e) {
        expiresAt = 'Lifetime';
        daysRemaining = 'Lifetime';
      }
    }

    res.json({
      success: true,
      data: {
        userId,
        isOwner: isUserOwner,
        hasLicense: !!licenseInfo || isUserOwner,
        licenseKey: licenseInfo?.license || (isUserOwner ? 'LIFETIME_OWNER_ACCESS' : null),
        isTrial: licenseInfo?.istrial === 1,
        expiresAt,
        isExpired,
        daysRemaining: isUserOwner ? 'Lifetime' : daysRemaining,
        botSlots,
        securedCount,
        totalNetworth
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Redeem license key
router.post('/redeem', (req, res) => {
  try {
    const userId = req.user.id;
    const { key } = req.body;

    if (!key || !key.trim()) {
      return res.status(400).json({ success: false, error: 'License key is required' });
    }

    const cleanKey = key.trim();

    // Check if key is available in licenses table
    const availableKey = get('SELECT * FROM licenses WHERE license = ?', [cleanKey]);

    if (!availableKey) {
      // Check if already used
      const alreadyUsed = get('SELECT * FROM usedLicenses WHERE license = ?', [cleanKey]);
      if (alreadyUsed) {
        return res.status(400).json({ success: false, error: 'This license key has already been redeemed!' });
      }
      return res.status(404).json({ success: false, error: 'Invalid license key.' });
    }

    // Calculate duration in milliseconds
    let durationDays = 30; // default 30 days
    if (availableKey.duration) {
      const dur = parseInt(availableKey.duration, 10);
      if (!isNaN(dur) && dur > 0) durationDays = dur;
    }

    const expiryTime = String(Date.now() + (durationDays * 24 * 60 * 60 * 1000));

    // Remove from unredeemed
    run('DELETE FROM licenses WHERE license = ?', [cleanKey]);

    // Check existing license
    const existing = get('SELECT * FROM usedLicenses WHERE user_id = ?', [userId]);
    if (existing) {
      // Extend expiry
      const currentExp = parseInt(existing.expiry, 10);
      const base = currentExp > Date.now() ? currentExp : Date.now();
      const newExp = String(base + (durationDays * 24 * 60 * 60 * 1000));
      run('UPDATE usedLicenses SET expiry = ?, license = ?, istrial = 0 WHERE user_id = ?', [newExp, cleanKey, userId]);
    } else {
      run(
        'INSERT INTO usedLicenses (license, user_id, expiry, istrial) VALUES (?, ?, ?, 0)',
        [cleanKey, userId, expiryTime]
      );
    }

    // Ensure slot exists
    const slotCheck = get('SELECT slots FROM slots WHERE user_id = ?', [userId]);
    if (!slotCheck) {
      run('INSERT INTO slots (user_id, slots) VALUES (?, 1)', [userId]);
    }

    res.json({
      success: true,
      message: `License successfully redeemed! Added ${durationDays} days.`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Claim free trial
router.post('/trial', (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user already claimed trial
    const claimed = get('SELECT trial FROM trial WHERE user_id = ?', [userId]);
    if (claimed) {
      return res.status(400).json({ success: false, error: 'You have already claimed your free trial!' });
    }

    const trialKey = generateKey('ExoTrial-');
    const twelveHoursMs = 12 * 60 * 60 * 1000;
    const expiry = String(Date.now() + twelveHoursMs);

    run('INSERT INTO trial (user_id, trial) VALUES (?, "1")', [userId]);

    const existingLicense = get('SELECT * FROM usedLicenses WHERE user_id = ?', [userId]);
    if (!existingLicense) {
      run(
        'INSERT INTO usedLicenses (license, user_id, expiry, istrial) VALUES (?, ?, ?, 1)',
        [trialKey, userId, expiry]
      );
    }

    // Give 1 slot
    const slotCheck = get('SELECT slots FROM slots WHERE user_id = ?', [userId]);
    if (!slotCheck) {
      run('INSERT INTO slots (user_id, slots) VALUES (?, 1)', [userId]);
    }

    res.json({
      success: true,
      message: '12-Hour Free Trial activated!',
      key: trialKey
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Recover / Transfer account data to new user ID
router.post('/recover', (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { oldUserId, targetUserId } = req.body;

    const fromUser = oldUserId ? oldUserId.trim() : null;
    const toUser = targetUserId ? targetUserId.trim() : currentUserId;

    if (!fromUser || !toUser) {
      return res.status(400).json({ success: false, error: 'oldUserId and targetUserId are required' });
    }

    if (!req.user.isAdmin && fromUser !== currentUserId) {
      return res.status(403).json({ success: false, error: 'Admin permission required to transfer third-party accounts' });
    }

    // Update tables
    run('UPDATE accounts SET user_id = ? WHERE user_id = ?', [toUser, fromUser]);
    run('UPDATE accountsbyuser SET user_id = ? WHERE user_id = ?', [toUser, fromUser]);
    run('UPDATE usedLicenses SET user_id = ? WHERE user_id = ?', [toUser, fromUser]);
    run('UPDATE slots SET user_id = ? WHERE user_id = ?', [toUser, fromUser]);
    run('UPDATE leaderboard SET user_id = ? WHERE user_id = ?', [toUser, fromUser]);

    res.json({
      success: true,
      message: `Successfully transferred all data and licenses from ${fromUser} to ${toUser}!`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
