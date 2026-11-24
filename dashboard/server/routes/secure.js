const express = require('express');
const router = express.Router();
const {
  getOrCreateUserSecureConfig,
  updateSecureConfig,
  secureWithOTP,
  secureWithRecoveryCode,
  secureWithZyger
} = require('../services/secureService');
const { query, run } = require('../db');

// Get user secureconfig
router.get('/config', (req, res) => {
  try {
    const config = getOrCreateUserSecureConfig(req.user.id);
    res.json({ success: true, config });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update user secureconfig
router.post('/config', (req, res) => {
  try {
    const updated = updateSecureConfig(req.user.id, req.body);
    res.json({ success: true, message: 'Settings saved', config: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Secure with OTP
router.post('/otp', async (req, res) => {
  try {
    const { email, otp, mcign } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, error: 'Email and OTP are required' });
    }

    const result = await secureWithOTP({
      userId: req.user.id,
      email: email.trim(),
      otp: otp.trim(),
      mcign: mcign ? mcign.trim() : null
    });

    if (result.success) {
      res.json({ success: true, message: 'Account secured with OTP!', ...result });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Secure with Recovery Code
router.post('/rec', async (req, res) => {
  try {
    const { email, recoveryCode, mcign } = req.body;
    if (!email || !recoveryCode) {
      return res.status(400).json({ success: false, error: 'Email and Recovery Code are required' });
    }

    const result = await secureWithRecoveryCode({
      userId: req.user.id,
      email: email.trim(),
      recoveryCode: recoveryCode.trim(),
      mcign: mcign ? mcign.trim() : null
    });

    if (result.success) {
      res.json({ success: true, message: 'Account secured with Recovery Code!', ...result });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Secure with Zyger (Password + Secret Key)
router.post('/zyger', async (req, res) => {
  try {
    const { email, password, secretKey, mcign } = req.body;
    if (!email || !password || !secretKey) {
      return res.status(400).json({ success: false, error: 'Email, Password, and Secret Key are required' });
    }

    const result = await secureWithZyger({
      userId: req.user.id,
      email: email.trim(),
      password: password.trim(),
      secretKey: secretKey.trim(),
      mcign: mcign ? mcign.trim() : null
    });

    if (result.success) {
      res.json({ success: true, message: 'Account secured with Zyger!', ...result });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Bulk Recovery Code Securing
router.post('/bulk-rec', async (req, res) => {
  try {
    const { lines } = req.body; // e.g. "email:recoverycode:mcign" or array of objects
    if (!lines) {
      return res.status(400).json({ success: false, error: 'Input lines required' });
    }

    const rawList = Array.isArray(lines) ? lines : lines.split('\n');
    const items = rawList
      .map(l => l.trim())
      .filter(Boolean)
      .map(line => {
        const parts = line.split(':');
        return {
          email: parts[0]?.trim(),
          recoveryCode: parts[1]?.trim(),
          mcign: parts[2]?.trim() || null
        };
      })
      .filter(item => item.email && item.recoveryCode);

    if (items.length === 0) {
      return res.status(400).json({ success: false, error: 'No valid lines formatted as email:recoverycode(:mcign)' });
    }

    const results = [];
    for (const item of items) {
      try {
        const resSec = await secureWithRecoveryCode({
          userId: req.user.id,
          email: item.email,
          recoveryCode: item.recoveryCode,
          mcign: item.mcign
        });
        results.push({
          email: item.email,
          success: resSec.success,
          uid: resSec.uid || null,
          error: resSec.error || null
        });
      } catch (e) {
        results.push({
          email: item.email,
          success: false,
          error: e.message
        });
      }
    }

    res.json({
      success: true,
      total: items.length,
      successful: results.filter(r => r.success).length,
      results
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Bulk OTP Securing
router.post('/bulk-otp', async (req, res) => {
  try {
    const { items } = req.body; // [{ email, otp, mcign }]
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Array of items required' });
    }

    const results = [];
    for (const item of items) {
      try {
        const resSec = await secureWithOTP({
          userId: req.user.id,
          email: item.email,
          otp: item.otp,
          mcign: item.mcign
        });
        results.push({
          email: item.email,
          success: resSec.success,
          uid: resSec.uid || null,
          error: resSec.error || null
        });
      } catch (e) {
        results.push({
          email: item.email,
          success: false,
          error: e.message
        });
      }
    }

    res.json({
      success: true,
      total: items.length,
      successful: results.filter(r => r.success).length,
      results
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
