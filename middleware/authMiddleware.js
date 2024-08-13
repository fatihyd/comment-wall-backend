const jwt = require("jsonwebtoken");
const User = require("../models/User");

/*
 * Decodes the token and attaches the user object to the request object
 */
const authMiddleware = async (req, res, next) => {
  // Extract the token
  const authorization = req.get("authorization");
  let token;

  if (authorization && authorization.startsWith("Bearer ")) {
    token = authorization.replace("Bearer ", "");
  }

  if (!token) {
    return res.status(401).json({ error: "token missing" });
  }

  // Check if token is valid
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  if (!decodedToken.userID) {
    return res.status(401).json({ error: "token invalid" });
  }
  // Find the user by the decoded token's id and attach it to the request object
  req.user = await User.findById(decodedToken.userID);
  next();
};

module.exports = authMiddleware;
