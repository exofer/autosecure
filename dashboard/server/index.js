const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const { authMiddleware } = require('./auth');
const { get, isOwner, getConfig } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(cookieParser());

// Serve static assets from public/
const publicDir = path.join(__dirname, '../public');
app.use(express.static(publicDir));

// Auth switch / session status endpoint
app.post('/api/auth/session', (req, res) => {
  try {
    const { userId, licenseKey } = req.body;
    let targetUserId = userId;

    if (licenseKey && !targetUserId) {
      // Look up user from license
      const row = get('SELECT user_id FROM usedLicenses WHERE license = ?', [licenseKey.trim()]);
      if (row) {
        targetUserId = row.user_id;
      } else {
        return res.status(404).json({ success: false, error: 'License key not found or not yet redeemed' });
      }
    }

    if (!targetUserId) {
      const config = getConfig();
      targetUserId = config.owners && config.owners[0] ? config.owners[0] : '1456875723494002908';
    }

    targetUserId = String(targetUserId).trim();
    const admin = isOwner(targetUserId);

    // Set cookie
    res.cookie('user_id', targetUserId, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: false,
      sameSite: 'lax'
    });

    res.json({
      success: true,
      user: {
        id: targetUserId,
        isAdmin: admin,
        isOwner: admin
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Current user info
app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// Apply auth middleware to all other /api routes
app.use('/api', authMiddleware);

// Mount API routes
app.use('/api/stats', require('./routes/stats'));
app.use('/api/accounts', require('./routes/accounts'));
app.use('/api/secure', require('./routes/secure'));
app.use('/api/emails', require('./routes/emails'));
app.use('/api/tools', require('./routes/tools'));
app.use('/api/bots', require('./routes/bots'));
app.use('/api/builder', require('./routes/builder'));
app.use('/api/proxies', require('./routes/proxies'));
app.use('/api/license', require('./routes/license'));
app.use('/api/admin', require('./routes/admin'));

// Fallback to SPA index.html
app.use((req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Start Server
if (require.main === module) {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Autosecure Dashboard Website Running!`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`📡 Network: http://0.0.0.0:${PORT}`);
    console.log(`⚡ Environment: Node.js ${process.version}`);
    console.log(`======================================================\n`);
  });

  process.on('SIGINT', () => {
    server.close(() => process.exit(0));
  });
}

module.exports = app;
