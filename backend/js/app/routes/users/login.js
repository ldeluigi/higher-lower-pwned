const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const user = require("../../model/user").schema;
const jwt = require("jsonwebtoken");
const pwd = require("../../utils/password");
const config = require("../../../config/config");

router.post("/login",
  [
    check("username")
      .notEmpty()
      .bail()
      .isAlphanumeric()
      .bail()
      .trim(),
    check("password")
      .isAlphanumeric()
      .bail()
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
      let hash = pwd.sha512(req.body.password, userQuery.salt).hash;
      if (hash != userQuery.password) {
        return res.status(400).json({ errors: ["Wrong credentials."] });
      }
      let jwtInfo = {
        id: userQuery._id,
        username: userQuery.username
      };
      const token = jwt.sign(jwtInfo, config.jwtSecret, { expiresIn: "10m" });
      res.json({
        data: {
          id: userQuery._id,
          username: userQuery.username,
          token: token,
          refresh: ""
        }
      });
    } catch (err) {
      res.status(400).json({ errors: [err.message] });
    }
  });


module.exports = router;
