const db = require('../database');

function auditLog(action, targetType, getTargetId, getDetails) {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = function (body) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const targetId = typeof getTargetId === 'function' ? getTargetId(req, body) : getTargetId;
        const details = typeof getDetails === 'function' ? getDetails(req, body) : getDetails;
        db.logAudit(req.user.id, req.user.username, action, targetType, targetId, details).catch(err => {
          console.error('Audit log error:', err);
        });
      }
      return originalJson(body);
    };
    next();
  };
}

module.exports = { auditLog };
