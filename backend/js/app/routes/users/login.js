const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const user = require("../../model/user.model").schema;
const pwd = require("../../utils/password");
const jwtTools = require("../../utils/jwt");

router.post("/login",
  [
    body("username")
      .notEmpty()
      .isAlphanumeric()
      .trim(),
    body("password")
      .isAlphanumeric()
      .trim()
      .isLength({ min: 8, max: 1024 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      let userQuery = await user.findOne({ username: req.body.username });
      if (userQuery === null) {
        return res.status(404).json({ errors: ["Wrong credentials."] });
      }
      let hash = pwd.hash(req.body.password, userQuery.salt);
      if (hash != userQuery.password) {
        return res.status(400).json({ errors: ["Wrong credentials."] });
      }
      try {
        userQuery.lastLogin = new Date();
        await userQuery.save();
        let { token, refresh } = await jwtTools.createJWT(userQuery._id, userQuery.username);
        res.json({
          data: {
            id: userQuery._id,
            username: userQuery.username,
            token: token,
            refresh: refresh
          }
        });
      } catch (err) {
        res.status(400).json({ errors: ["Token creation error: " + err.message] });
      }
    } catch (err) {
      res.status(400).json({ errors: [err.message] });
    }
  });


module.exports = router;
