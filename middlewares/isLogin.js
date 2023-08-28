const getTokenFromHeader = require("../utils/getTokenFromHeader");
const verifyToken = require("../utils/verifyToken");
const { appErrFunc } = require("../utils/appError");

const isLogin = (req, res, next) => {
  // Get token from header
  const token = getTokenFromHeader(req);

  // Verify the token
  const decodedUser = verifyToken(token);

  // Save the user into req object
  req.userAuth = decodedUser.id;

  if (!decodedUser) {
    return next(appErrFunc("Invalid/Expire Token, please login again", 401));
  } else {
    next();
  }
};

module.exports = isLogin;
