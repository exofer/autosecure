const express = require('express');
const router = express.Router();
const { query, get, run, getConfig } = require('../db');

function extractCodeFromText(text) {
  if (!text) return null;
  // Patterns for security codes / OTPs / passwords
  const patterns = [
    /(?:code|security code|use code|verification code|is|otp)[\s:]*([0-9]{4,8})/i,
    /\b([0-9]{6,7})\b/,
    /\b([A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5})\b/
  ];

  for (const regex of patterns) {
    const match = text.match(regex);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

// List & search emails
router.get('/', (req, res) => {
  try {
    const { search = '', limit = 30, offset = 0 } = req.query;
    const limitNum = Math.min(100, Math.max(5, parseInt(limit, 10) || 30));
    const offsetNum = Math.max(0, parseInt(offset, 10) || 0);

    const conditions = [];
    const params = [];

    if (search.trim()) {
      const term = `%${search.trim()}%`;
      conditions.push('(sender LIKE ? OR receiver LIKE ? OR subject LIKE ? OR description LIKE ?)');
      params.push(term, term, term, term);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const totalRow = get(`SELECT COUNT(*) as count FROM emails ${whereClause}`, params);
    const emails = query(
      `SELECT id, sender, receiver, subject, time, ip, description FROM emails ${whereClause} ORDER BY id DESC LIMIT ? OFFSET ?`,
      [...params, limitNum, offsetNum]
    );

    const enriched = emails.map(email => ({
      ...email,
      extractedCode: extractCodeFromText(email.description || email.subject)
    }));

    res.json({
      success: true,
      data: {
        emails: enriched,
        total: totalRow?.count || 0,
        limit: limitNum,
        offset: offsetNum
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single email
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const email = get('SELECT * FROM emails WHERE id = ?', [id]);

    if (!email) {
      return res.status(404).json({ success: false, error: 'Email not found' });
    }

    const code = extractCodeFromText(email.description || email.subject);

    res.json({
      success: true,
      data: {
        ...email,
        extractedCode: code
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get registered & notifier emails for user
router.get('/meta/registered', (req, res) => {
  try {
    const userId = req.user.id;
    const registered = query('SELECT email FROM registeredemails WHERE user_id = ?', [userId]);
    const notifier = query('SELECT email FROM email_notifier WHERE user_id = ?', [userId]);

    const config = getConfig();
    const domains = config.domains || ['exodev.sbs'];

    res.json({
      success: true,
      data: {
        registeredEmails: registered.map(r => r.email),
        notifierEmails: notifier.map(n => n.email),
        availableDomains: domains
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Register new email on domain
router.post('/register', (req, res) => {
  try {
    const userId = req.user.id;
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Valid email required' });
    }

    const existing = get('SELECT 1 FROM registeredemails WHERE email = ?', [email]);
    if (existing) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }

    run('INSERT INTO registeredemails (user_id, email) VALUES (?, ?)', [userId, email.trim().toLowerCase()]);
    res.json({ success: true, message: `Email ${email} successfully registered!` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete registered email
router.delete('/register', (req, res) => {
  try {
    const userId = req.user.id;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email required' });
    }

    run('DELETE FROM registeredemails WHERE user_id = ? AND email = ?', [userId, email]);
    res.json({ success: true, message: 'Registered email removed' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update notifier email
router.post('/notifier', (req, res) => {
  try {
    const userId = req.user.id;
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Valid email required' });
    }

    const existing = get('SELECT 1 FROM email_notifier WHERE user_id = ? AND email = ?', [userId, email]);
    if (!existing) {
      run('INSERT INTO email_notifier (user_id, email) VALUES (?, ?)', [userId, email.trim().toLowerCase()]);
    }

    res.json({ success: true, message: 'Notification email configured!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
