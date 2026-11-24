const express = require('express');
const router = express.Router();
const { query, get, run } = require('../db');

// List bots
router.get('/', (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.isAdmin;
    const { scope = 'user' } = req.query;

    const bots = query(
      isAdmin && scope === 'all'
        ? 'SELECT id, botnumber, lastsavedname, server_id, user_id, prefix, domain, activity, verification_type FROM autosecure ORDER BY id ASC'
        : 'SELECT id, botnumber, lastsavedname, server_id, user_id, prefix, domain, activity, verification_type FROM autosecure WHERE user_id = ? ORDER BY id ASC',
      isAdmin && scope === 'all' ? [] : [userId]
    );

    // Slots info
    const slotsRow = get('SELECT slots FROM slots WHERE user_id = ?', [userId]);
    const maxSlots = slotsRow?.slots || 1;

    res.json({
      success: true,
      data: {
        bots,
        usedSlots: bots.length,
        maxSlots
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add new bot
router.post('/', (req, res) => {
  try {
    const userId = req.user.id;
    const { token, prefix = 'old', domain = 'exodev.sbs', server_id = '', activity = '' } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, error: 'Bot token is required' });
    }

    // Check user slots
    const slotsRow = get('SELECT slots FROM slots WHERE user_id = ?', [userId]);
    const maxSlots = slotsRow?.slots || 1;
    const currentBots = get('SELECT COUNT(*) as count FROM autosecure WHERE user_id = ?', [userId])?.count || 0;

    if (currentBots >= maxSlots && !req.user.isAdmin) {
      return res.status(400).json({
        success: false,
        error: `Slot limit reached (${currentBots}/${maxSlots}). Contact administrator to upgrade bot slots.`
      });
    }

    const nextBotNumber = currentBots + 1;
    const nowEpoch = Math.floor(Date.now() / 1000);

    run(
      `INSERT INTO autosecure (
        botnumber, user_id, token, prefix, domain, server_id, activity, creationdate
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nextBotNumber, userId, token.trim(), prefix.trim(), domain.trim(), server_id.trim(), activity.trim(), nowEpoch]
    );

    res.json({ success: true, message: `Bot #${nextBotNumber} added successfully!` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update bot activity
router.put('/:id/activity', (req, res) => {
  try {
    const { id } = req.params;
    const { activity } = req.body;

    const bot = get('SELECT * FROM autosecure WHERE id = ?', [id]);
    if (!bot) return res.status(404).json({ success: false, error: 'Bot not found' });

    if (!req.user.isAdmin && bot.user_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized to edit this bot' });
    }

    run('UPDATE autosecure SET activity = ? WHERE id = ?', [activity || '', id]);
    res.json({ success: true, message: 'Bot activity updated' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete bot
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const bot = get('SELECT * FROM autosecure WHERE id = ?', [id]);
    if (!bot) return res.status(404).json({ success: false, error: 'Bot not found' });

    if (!req.user.isAdmin && bot.user_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized to delete this bot' });
    }

    run('DELETE FROM autosecure WHERE id = ?', [id]);
    res.json({ success: true, message: 'Bot deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Export bot config
router.get('/:id/config', (req, res) => {
  try {
    const { id } = req.params;
    const bot = get('SELECT * FROM autosecure WHERE id = ?', [id]);
    if (!bot) return res.status(404).json({ success: false, error: 'Bot not found' });

    if (!req.user.isAdmin && bot.user_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    // Mask sensitive token
    const safeBot = {
      ...bot,
      token: bot.token ? `${bot.token.substring(0, 10)}...` : ''
    };

    res.json({ success: true, config: safeBot });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
