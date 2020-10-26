const config = require("../../config/config");
const pwd = require("../utils/password");
const jwt = require("jsonwebtoken");
const jwtValidator = require('express-jwt');
const tokenSchema = require("../model/token.model").schema;

module.exports = {
  createJWT: async function (userID, username) {
    let jwtID = pwd.genRandomString(32);
    let jwtContent = {
      id: userID,
      username: username,
      refresh: jwtID
    };
    let token = jwt.sign(jwtContent, config.jwtSecret, { expiresIn: "10m", algorithm: "HS256" });
    let refresh = pwd.genRandomString(64);
    await tokenSchema.create({
      token: refresh,
      expire: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7 * 8), // 8 weeks from now
      jwtRef: jwtID,
      user: userID
    });
    return {
      token: token,
      refresh: refresh
    };
  },
  authentication: function () {
    return jwtValidator({ secret: config.jwtSecret, requestProperty: 'auth', algorithms: ['HS256'] });
  },
  checkJWT: function (token, ignoreExpiration = false) {
    return jwt.verify(token, config.jwtSecret, {
      ignoreExpiration: ignoreExpiration,
      algorithm: "HS256"
    });
  }
}
