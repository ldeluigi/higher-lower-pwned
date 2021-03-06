const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const tokenSchema = require("../../model/token.model").schema;
const jwtTools = require("../../utils/jwt");
const userSchema = require("../../model/user.model").schema;

router.post(
  "/refresh",
  [
    body("token")
      .notEmpty()
      .isJWT()
      .trim(),
    body("refresh")
      .notEmpty()
      .isAlphanumeric()
      .trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      let token = req.body.token;
      let refreshToken = req.body.refresh;
      let tokenQuery = await tokenSchema.findOne({ token: refreshToken });
      if (tokenQuery === null) {
        return res.status(404).json({ errors: ["Refresh token not found."] });
      }
      if (tokenQuery.expire < new Date()) {
        await tokenSchema.deleteOne({ token: refreshToken });
        return res.status(400).json({
          errors: ["Refresh token is expired. Repeat the login process."],
        });
      }
      let tokenPayload = jwtTools.checkJWT(token, true);
      if (tokenPayload.jti != tokenQuery.jwtRef) {
        return res.status(400).json({ errors: ["Invalid token references."] });
      }
      await tokenSchema.deleteOne({ _id: tokenQuery._id });
      let userQuery = await userSchema.findById(tokenPayload.sub);
      if (userQuery === null) {
        return res.status(400).json({ errors: ["User invalid. Token generation aborted."] });
      }
      let userID = userQuery._id;
      let username = userQuery.username;
      let resultJWT = await jwtTools.createJWT(userID, username);
      res.json({
        data: {
          id: userID,
          username: username,
          token: resultJWT.token,
          refresh: resultJWT.refresh
        }
      });
    } catch (err) {
      res.status(400).json({ errors: [err.message] });
    }
  }
);

module.exports = router;
