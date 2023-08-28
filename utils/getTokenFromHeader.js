const getTokenFromHeader = (req) => {
  // Get token from header
  const headerObj = req.headers;

  const token = headerObj.authorization.split(" ")[1];
  // const token = headerObj["authorization"].split(" ")[1];

  if (token !== undefined) {
    return token;
  } else {
    // return { success: false, message: "No token provided." };
    return false;
  }
};

module.exports = getTokenFromHeader;
