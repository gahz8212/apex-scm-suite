/**
 * 인증 및 인가(RBAC) 공통 미들웨어
 */

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({
    success: false,
    message: "로그인이 필요한 서비스입니다.",
    code: "UNAUTHORIZED",
  });
};

const isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return next();
  }
  return res.status(400).json({
    success: false,
    message: "이미 로그인되어 있는 상태입니다.",
    code: "ALREADY_LOGGED_IN",
  });
};

/**
 * 역할 기반 권한 검증 미들웨어
 * @param  {...string} roles - 허용할 역할 목록 (예: 'ADMIN', 'MANAGER')
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        message: "로그인이 필요한 서비스입니다.",
        code: "UNAUTHORIZED",
      });
    }

    const currentRole = req.user && req.user.role ? req.user.role : "USER";
    if (roles.includes(currentRole)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `접근 권한이 없습니다. (필요 권한: ${roles.join(", ")}, 현재 권한: ${currentRole})`,
      code: "FORBIDDEN",
    });
  };
};

module.exports = {
  isLoggedIn,
  isNotLoggedIn,
  requireRole,
};
