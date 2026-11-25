const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../../db/database.db');
const configPath = path.resolve(__dirname, '../../config.json');

let config = {};
try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (e) {
  console.error('[DB] Failed to load config.json:', e.message);
}

const db = new DatabaseSync(dbPath);

// Enable WAL mode and foreign keys for optimal performance and safety
try {
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');
} catch (e) {
  // PRAGMA may not be critical
}

// Ensure user_id columns, indexes, and ownership backfills exist when dashboard starts standalone
try {
  for (const table of ['accounts', 'extrainformation']) {
    const tblExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(table);
    if (tblExists) {
      const cols = db.prepare(`PRAGMA table_info(${table})`).all();
      if (!cols.some(c => c.name === 'user_id')) {
        db.exec(`ALTER TABLE ${table} ADD COLUMN user_id TEXT`);
      }
    }
  }
  const hasAccounts = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='accounts'").get();
  const hasByUser = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='accountsbyuser'").get();
  const hasExtra = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='extrainformation'").get();

  if (hasAccounts) db.exec('CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id)');
  if (hasByUser) db.exec('CREATE INDEX IF NOT EXISTS idx_accountsbyuser_user_uid ON accountsbyuser(user_id, uid)');
  if (hasExtra) db.exec('CREATE INDEX IF NOT EXISTS idx_extrainformation_user_id ON extrainformation(user_id)');

  if (hasAccounts && hasByUser) {
    db.exec(`
      UPDATE accounts
      SET user_id = (
        SELECT user_id FROM accountsbyuser
        WHERE accountsbyuser.uid = accounts.uid AND user_id IS NOT NULL AND user_id != ''
        LIMIT 1
      )
      WHERE (user_id IS NULL OR user_id = '')
        AND EXISTS (
          SELECT 1 FROM accountsbyuser
          WHERE accountsbyuser.uid = accounts.uid AND user_id IS NOT NULL AND user_id != ''
        );
      INSERT INTO accountsbyuser (user_id, uid, time, claimed)
      SELECT a.user_id, a.uid, a.time, 0
      FROM accounts a
      WHERE a.user_id IS NOT NULL AND a.user_id != ''
        AND NOT EXISTS (
          SELECT 1 FROM accountsbyuser ab WHERE ab.uid = a.uid AND ab.user_id = a.user_id
        );
    `);
  }
  if (hasExtra && hasAccounts && hasByUser) {
    db.exec(`
      UPDATE extrainformation
      SET user_id = COALESCE(
        (SELECT user_id FROM accounts WHERE accounts.uid = extrainformation.uid AND user_id IS NOT NULL AND user_id != '' LIMIT 1),
        (SELECT user_id FROM accountsbyuser WHERE accountsbyuser.uid = extrainformation.uid AND user_id IS NOT NULL AND user_id != '' LIMIT 1)
      )
      WHERE user_id IS NULL OR user_id = '';
    `);
  }
} catch (e) {
  console.error('[DB] Ownership schema migration error:', e.message);
}

function query(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    const rows = stmt.all(...params);
    // Convert to plain JS objects
    return rows.map(r => ({ ...r }));
  } catch (err) {
    console.error(`[DB Query Error] ${sql}`, params, err);
    throw err;
  }
}

function get(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    const row = stmt.get(...params);
    return row ? { ...row } : null;
  } catch (err) {
    console.error(`[DB Get Error] ${sql}`, params, err);
    throw err;
  }
}

function run(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    return stmt.run(...params);
  } catch (err) {
    console.error(`[DB Run Error] ${sql}`, params, err);
    throw err;
  }
}

function isOwner(userId) {
  if (!userId) return false;
  const owners = config.owners || [];
  return owners.includes(String(userId).trim());
}

function getConfig() {
  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch {
    return config;
  }
}

module.exports = {
  db,
  query,
  get,
  run,
  isOwner,
  getConfig
};
