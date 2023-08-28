const getTokenFromHeader = require("../utils/getTokenFromHeader");
const verifyToken = require("../utils/verifyToken");
const { appErrFunc } = require("../utils/appError");
const User = require("../model/User");

const isAdmin = async (req, res, next) => {
  // Get token from header
  const token = getTokenFromHeader(req);

  // Verify the token
  const decodedUser = verifyToken(token);

  // Save the user into req object
  req.userAuth = decodedUser.id;
  console.log(decodedUser.id);

  //   Find the User in DB
  const user = await User.findById(decodedUser.id);

  // Check if Admin
  if (user.isAdmin) {
    return next();
  } else {
    return next(appErrFunc("Access Denied, You are not Admin", 403));
  }
};

module.exports = isAdmin;
