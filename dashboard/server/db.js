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
