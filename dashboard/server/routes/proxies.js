const express = require('express');
const router = express.Router();
const axios = require('axios');
const { query, get, run } = require('../db');

// List proxies
router.get('/', (req, res) => {
  try {
    const userId = req.user.id;
    const proxies = query('SELECT * FROM proxies WHERE user_id = ? ORDER BY rowid DESC', [userId]);
    res.json({ success: true, proxies });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add proxy
router.post('/', (req, res) => {
  try {
    const userId = req.user.id;
    const { proxy } = req.body;

    if (!proxy || !proxy.trim()) {
      return res.status(400).json({ success: false, error: 'Proxy address required' });
    }

    const cleanProxy = proxy.trim();
    run('INSERT INTO proxies (user_id, proxy) VALUES (?, ?)', [userId, cleanProxy]);
    res.json({ success: true, message: 'Proxy added successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test proxy
router.post('/test', async (req, res) => {
  try {
    const { proxy } = req.body;
    if (!proxy) return res.status(400).json({ success: false, error: 'Proxy required' });

    const startTime = Date.now();
    // Test connectivity
    let proxyAgent = null;
    try {
      const parts = proxy.split(':');
      if (parts.length === 4) {
        const [host, port, user, pass] = parts;
        const proxyUrl = `http://${user}:${pass}@${host}:${port}`;
        const { HttpsProxyAgent } = require('https-proxy-agent');
        proxyAgent = new HttpsProxyAgent(proxyUrl);
      }
    } catch (e) {}

    const config = {
      timeout: 8000
    };
    if (proxyAgent) config.httpsAgent = proxyAgent;

    const testRes = await axios.get('https://api.ipify.org?format=json', config);
    const latency = Date.now() - startTime;

    res.json({
      success: true,
      ip: testRes.data?.ip,
      latencyMs: latency
    });
  } catch (error) {
    res.json({
      success: false,
      error: `Proxy connection test failed: ${error.message}`
    });
  }
});

// Delete proxy
router.delete('/:id', (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    run('DELETE FROM proxies WHERE rowid = ? AND user_id = ?', [id, userId]);
    res.json({ success: true, message: 'Proxy removed' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
