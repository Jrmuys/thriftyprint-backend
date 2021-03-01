/**
 * Defines controller to generate secure json web token
 * @module controller/auth
 */
const jwt = require("jsonwebtoken");
const config = require("../config/config");

/**
 * Generates a jwt token for a user
 * @param {User} user 
 * @return {any} Signed json web token
 */
function generateToken(user) {
  const payload = user;
  return jwt.sign(payload, config.jwtSecret, { expiresIn: "1h" });
  // return jwt.sign(JSON.stringify(payload), config.jwtSecret);
}
// { expireIn: "1h" }
module.exports = { generateToken };
