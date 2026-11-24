const axios = require('axios');
const path = require('path');
const { get, run, query } = require('../db');

// Helper to decode JWT payload safely
function decodeJwt(token) {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payloadBase64 = parts[1];
    const payload = Buffer.from(payloadBase64, 'base64').toString('utf-8');
    return JSON.parse(payload);
  } catch (error) {
    return null;
  }
}

async function getMojangProfile(usernameOrUuid) {
  try {
    const isUuid = /^[0-9a-f]{32}$/i.test(usernameOrUuid.replace(/-/g, ''));
    if (isUuid) {
      const cleanUuid = usernameOrUuid.replace(/-/g, '');
      const res = await axios.get(`https://sessionserver.mojang.com/session/minecraft/profile/${cleanUuid}`, { timeout: 6000 });
      return {
        id: res.data?.id,
        name: res.data?.name,
        properties: res.data?.properties
      };
    } else {
      const res = await axios.get(`https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(usernameOrUuid)}`, { timeout: 6000 });
      return {
        id: res.data?.id,
        name: res.data?.name
      };
    }
  } catch (e) {
    return null;
  }
}

async function checkSSID(ssid) {
  if (!ssid || ssid.length < 10) {
    return { valid: false, error: 'SSID is too short or missing' };
  }

  const payload = decodeJwt(ssid);
  let expiresAt = null;
  let isExpired = false;

  if (payload && payload.exp) {
    expiresAt = new Date(payload.exp * 1000).toISOString();
    isExpired = Date.now() > payload.exp * 1000;
  }

  try {
    const res = await axios.get('https://api.minecraftservices.com/minecraft/profile', {
      headers: {
        Authorization: `Bearer ${ssid}`
      },
      timeout: 8000,
      validateStatus: () => true
    });

    if (res.status === 200 && res.data) {
      return {
        valid: true,
        isExpired,
        expiresAt,
        tokenPayload: payload,
        profile: {
          id: res.data.id,
          name: res.data.name,
          skins: res.data.skins || [],
          capes: res.data.capes || []
        }
      };
    }

    if (res.status === 401) {
      return {
        valid: false,
        isExpired: true,
        expiresAt,
        error: 'Unauthorized - SSID is expired or invalid'
      };
    }

    return {
      valid: false,
      isExpired,
      expiresAt,
      error: `API returned status ${res.status}: ${res.statusText || 'Failed'}`
    };
  } catch (err) {
    return {
      valid: false,
      isExpired,
      expiresAt,
      error: err.message
    };
  }
}

async function changeSkin(ssid, skinUrl, variant = 'classic') {
  if (!ssid) throw new Error('SSID required');
  if (!skinUrl) throw new Error('Skin URL required');

  try {
    const res = await axios.post(
      'https://api.minecraftservices.com/minecraft/profile/skins',
      { variant: variant || 'classic', url: skinUrl },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ssid}`
        },
        timeout: 10000,
        validateStatus: () => true
      }
    );

    if (res.status === 200) {
      return { success: true, message: 'Skin successfully changed' };
    } else if (res.status === 400) {
      return { success: false, error: 'Invalid skin URL or format' };
    } else if (res.status === 401) {
      return { success: false, error: 'Unauthorized: SSID expired or invalid' };
    } else {
      return { success: false, error: `Error ${res.status}: ${res.data?.errorMessage || 'Failed to update skin'}` };
    }
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function changeIGN(ssid, newName) {
  if (!ssid) throw new Error('SSID required');
  if (!newName) throw new Error('New username required');

  if (!/^[a-zA-Z0-9_]{3,16}$/.test(newName)) {
    return { success: false, error: 'Invalid username. Must be 3-16 alphanumeric characters or underscores.' };
  }

  try {
    const res = await axios.put(
      `https://api.minecraftservices.com/minecraft/profile/name/${encodeURIComponent(newName)}`,
      '',
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ssid}`
        },
        timeout: 10000,
        validateStatus: () => true
      }
    );

    if (res.status === 200) {
      return { success: true, message: `Username successfully changed to ${newName}` };
    } else if (res.status === 400) {
      return { success: false, error: 'Username unavailable or invalid' };
    } else if (res.status === 401) {
      return { success: false, error: 'Unauthorized: SSID expired or invalid' };
    } else {
      return { success: false, error: `Failed to change username (Status: ${res.status})` };
    }
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function getHypixelStatus(usernameOrUuid) {
  const profile = await getMojangProfile(usernameOrUuid);
  if (!profile || !profile.id) {
    return { success: false, error: 'Could not find Minecraft player' };
  }

  const cleanUuid = profile.id.replace(/-/g, '');
  const username = profile.name;

  try {
    const res = await axios.get(`https://hypixel.paniek.de/player/${cleanUuid}/status`, { timeout: 6000 });
    const statusData = res.data?.status || {};

    return {
      success: true,
      username,
      uuid: cleanUuid,
      online: statusData.online === true,
      game: statusData.game || null,
      mode: statusData.mode_fancy || statusData.mode || null
    };
  } catch (e) {
    return {
      success: true,
      username,
      uuid: cleanUuid,
      online: false,
      game: null,
      mode: null,
      note: 'Could not query live session or player is offline'
    };
  }
}

async function getPlayerStats(username) {
  try {
    // Check local database cache first
    const cached = get('SELECT * FROM stats WHERE name = ? COLLATE NOCASE', [username]);
    if (cached && cached.stats) {
      try {
        const parsed = JSON.parse(cached.stats);
        return { success: true, stats: parsed, cached: true };
      } catch (err) {}
    }

    // Try requiring existing getStats module if available
    try {
      const getStats = require('../../autosecure/utils/hypixelapi/getStats');
      const stats = await getStats(username);
      if (stats) {
        return { success: true, stats, cached: false };
      }
    } catch (e) {
      // Fallback
    }

    // Basic Mojang + Visage profile
    const mojang = await getMojangProfile(username);
    if (!mojang) return { success: false, error: 'Player not found on Mojang' };

    return {
      success: true,
      stats: {
        name: mojang.name,
        uuid: mojang.id,
        online: { status: false, game: null },
        bedwars: { wins: 0, losses: 0, finalKills: 0, finalDeaths: 0, level: 0 },
        skywars: { wins: 0, losses: 0, kills: 0, deaths: 0, level: 0 },
        duels: { wins: 0, losses: 0, kills: 0, deaths: 0 },
        skyblock: []
      }
    };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function checkAccountLocked(email) {
  try {
    const checklocked = require('../../autosecure/utils/secure/checklocked');
    const result = await checklocked(email);
    return { success: true, data: result };
  } catch (err) {
    return {
      success: false,
      error: err.message,
      data: { locked: 'error', reason: err.message }
    };
  }
}

async function checkLunarCosmetics(ssid) {
  try {
    const { getlunar } = require('../../autosecure/utils/lunarapi/src/index');
    const result = await getlunar(ssid);
    return { success: true, cosmetics: result || [] };
  } catch (err) {
    return { success: false, error: err.message, cosmetics: [] };
  }
}

async function checkAccountBan(ssid) {
  try {
    const bancheckmsg = require('../../autosecure/utils/bancheckappeal/bancheckmsg');
    const result = await bancheckmsg(ssid);
    return { success: true, result };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function requestOTPCode(email, securityProof) {
  try {
    const getCredentials = require('../../autosecure/utils/info/getCredentials');
    const sendotp = require('../../autosecure/utils/secure/sendotp');

    const creds = await getCredentials(email, false);
    const proofs = creds?.Credentials?.OtcLoginEligibleProofs || [];

    if (!proofs.length) {
      return { success: false, error: 'No OTP security proofs found for this email address or OTP is disabled.' };
    }

    if (!securityProof) {
      return {
        success: true,
        requireProofSelection: true,
        proofs: proofs.map((p, index) => ({
          index,
          id: p.data,
          display: p.display || p.data,
          type: p.type || 'Email/Phone'
        }))
      };
    }

    const sent = await sendotp(email, securityProof);
    return { success: sent, message: sent ? 'OTP code requested successfully!' : 'Failed to send OTP code.' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

module.exports = {
  checkSSID,
  changeSkin,
  changeIGN,
  getHypixelStatus,
  getPlayerStats,
  checkAccountLocked,
  checkLunarCosmetics,
  checkAccountBan,
  requestOTPCode,
  getMojangProfile
};
