const cooldowns = new Map();
const activeLocks = new Set();

/**
 * Checks whether an action key is currently on cooldown without consuming it.
 * @param {string} key
 * @param {number} durationMs
 * @returns {{ allowed: boolean, retryAfterSec: number }}
 */
function checkCooldown(key, durationMs) {
  const now = Date.now();
  const expiresAt = cooldowns.get(key);
  if (expiresAt && now < expiresAt) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil((expiresAt - now) / 1000)
    };
  }
  return { allowed: true, retryAfterSec: 0 };
}

/**
 * Starts or refreshes a cooldown window for the given key.
 * @param {string} key
 * @param {number} durationMs
 */
function startCooldown(key, durationMs) {
  cooldowns.set(key, Date.now() + durationMs);
  // Opportunistic prune so long-running bot processes don't accumulate stale keys
  if (cooldowns.size > 500) {
    const now = Date.now();
    for (const [k, exp] of cooldowns.entries()) {
      if (now >= exp) cooldowns.delete(k);
    }
  }
}

/**
 * Attempts to acquire an in-flight lock to prevent double-click / concurrent spam.
 * @param {string} key
 * @returns {boolean} True if lock acquired, false if already locked
 */
function acquireLock(key) {
  if (activeLocks.has(key)) return false;
  activeLocks.add(key);
  return true;
}

/**
 * Releases an in-flight lock.
 * @param {string} key
 */
function releaseLock(key) {
  activeLocks.delete(key);
}

module.exports = {
  checkCooldown,
  startCooldown,
  acquireLock,
  releaseLock
};
