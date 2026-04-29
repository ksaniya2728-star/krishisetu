const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`Role (${req.user?.role || 'none'}) is not authorized to access this resource`);
    }
    next();
  };
};

module.exports = { authorizeRoles };
