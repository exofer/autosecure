const { isOwner, get, query, getConfig } = require('./db');

function authMiddleware(req, res, next) {
  // Check headers, query, or cookies for user identification
  let userId = req.headers['x-user-id'] || 
               req.cookies?.user_id || 
               req.query?.user_id;

  const config = getConfig();
  const defaultOwner = config.owners && config.owners[0] ? config.owners[0] : '1456875723494002908';

  // If no user ID provided, default to the primary owner for seamless experience
  if (!userId) {
    userId = defaultOwner;
  }

  userId = String(userId).trim();
  const admin = isOwner(userId);

  // Check if user is blacklisted
  const blacklistCheck = get(
    `SELECT reason FROM autosecureblacklist WHERE user_id = ? 
     UNION 
     SELECT 'Blacklisted' as reason FROM blacklisted WHERE user_id = ?`,
    [userId, userId]
  );

  req.user = {
    id: userId,
    isOwner: admin,
    isAdmin: admin,
    isBlacklisted: !!blacklistCheck,
    blacklistReason: blacklistCheck ? blacklistCheck.reason : null
  };

  next();
}

function requireAdmin(req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      error: 'Admin access required. Your Discord ID is not registered as an owner in config.json.'
    });
  }
  next();
}

module.exports = {
  authMiddleware,
  requireAdmin
};
