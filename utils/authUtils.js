const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

/*
 * Generates a signed JWT for a given user ID (used for identifying the user in subsequent requests)
 * The token includes the user ID as a payload and is signed with a secret key
 */
const generateJWT = (userID) => {
  const PAYLOAD = { userID };
  const token = jwt.sign(PAYLOAD, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  return token;
};
/*
 * Verifies a JWT and returns the decoded payload if valid
 */
const verifyJWT = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/*
 * Hashes a password using bcrypt with a predefined number of salt rounds
 */
const hashPassword = async (password) => {
  const SALT_ROUNDS = 10;
  return await bcrypt.hash(password, SALT_ROUNDS);
};

/*
 * Compares a plain text password with a hashed password
 */
const comparePasswords = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

module.exports = {
  generateJWT,
  verifyJWT,
  hashPassword,
  comparePasswords,
};
