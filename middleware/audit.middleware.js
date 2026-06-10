const AuditLog = require("../models/auditLog.model");

const auditLog = (action, target) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = async (data) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          await AuditLog.create({
            admin: req.user?.id,
            action,
            target,
            targetId: req.params?.id || null,
            details: `${action} ${target}${req.params?.id ? ` (ID: ${req.params.id})` : ''}`,
            ip: req.ip,
          });
        } catch (err) {
          console.log("Audit log failed:", err.message);
        }
      }
      return originalJson(data);
    };
    next();
  };
};

module.exports = { auditLog };