const express = require('express');
const router = express.Router();
const { query, get, run } = require('../db');
const {
  checkSSID,
  changeSkin,
  changeIGN,
  getHypixelStatus,
  getPlayerStats,
  checkAccountLocked,
  checkLunarCosmetics,
  checkAccountBan,
  requestOTPCode
} = require('../services/minecraftService');

// SSID Checker
router.post('/ssid/check', async (req, res) => {
  try {
    const { ssid } = req.body;
    if (!ssid) return res.status(400).json({ success: false, error: 'SSID required' });

    const result = await checkSSID(ssid.trim());
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Change Skin
router.post('/ssid/change-skin', async (req, res) => {
  try {
    const { ssid, skinUrl, variant = 'classic' } = req.body;
    if (!ssid || !skinUrl) {
      return res.status(400).json({ success: false, error: 'SSID and Skin URL required' });
    }

    const result = await changeSkin(ssid.trim(), skinUrl.trim(), variant);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Change IGN
router.post('/ssid/change-ign', async (req, res) => {
  try {
    const { ssid, newName } = req.body;
    if (!ssid || !newName) {
      return res.status(400).json({ success: false, error: 'SSID and New Name required' });
    }

    const result = await changeIGN(ssid.trim(), newName.trim());
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Hypixel Online Status
router.post('/hypixel/status', async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ success: false, error: 'Username or UUID required' });

    const result = await getHypixelStatus(username.trim());
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Hypixel Stats
router.post('/hypixel/stats', async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ success: false, error: 'Username required' });

    const result = await getPlayerStats(username.trim());
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Lunar Cosmetics
router.post('/cosmetics', async (req, res) => {
  try {
    const { ssid } = req.body;
    if (!ssid) return res.status(400).json({ success: false, error: 'SSID required' });

    const result = await checkLunarCosmetics(ssid.trim());
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Ban Check
router.post('/check-ban', async (req, res) => {
  try {
    const { ssid } = req.body;
    if (!ssid) return res.status(400).json({ success: false, error: 'SSID required' });

    const result = await checkAccountBan(ssid.trim());
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Check Locked MS Account
router.post('/check-locked', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: 'Email required' });

    const result = await checkAccountLocked(email.trim());
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Request OTP
router.post('/request-otp', async (req, res) => {
  try {
    const { email, securityProof } = req.body;
    if (!email) return res.status(400).json({ success: false, error: 'Email required' });

    const result = await requestOTPCode(email.trim(), securityProof);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Quarantine - List
router.get('/quarantine', (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.isAdmin;
    const { scope = 'user' } = req.query;

    const list = query(
      isAdmin && scope === 'all'
        ? 'SELECT * FROM quarantine ORDER BY time DESC'
        : 'SELECT * FROM quarantine WHERE user_id = ? ORDER BY time DESC',
      isAdmin && scope === 'all' ? [] : [userId]
    );

    res.json({ success: true, quarantine: list });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Quarantine - Add
router.post('/quarantine', (req, res) => {
  try {
    const userId = req.user.id;
    const { id, ssid, uuid, name } = req.body;

    const qId = id || Math.random().toString(36).substring(2, 10);
    const timeNow = String(Date.now());

    run(
      'INSERT INTO quarantine (id, user_id, ssid, uuid, name, time) VALUES (?, ?, ?, ?, ?, ?)',
      [qId, userId, ssid || '', uuid || '', name || 'Unknown', timeNow]
    );

    res.json({ success: true, message: 'Account added to quarantine', id: qId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Quarantine - Remove
router.delete('/quarantine/:id', (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (req.user.isAdmin) {
      run('DELETE FROM quarantine WHERE id = ?', [id]);
    } else {
      run('DELETE FROM quarantine WHERE id = ? AND user_id = ?', [id, userId]);
    }

    res.json({ success: true, message: 'Removed from quarantine' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
