const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const userSchema = require("../../model/user").schema;
const userToDto = require("../../model/user").toDto;
const pwd = require("../../utils/password");


router.post("/",
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
      .isLength({ min: 8, max: 1024 }),
    check("email")
      .normalizeEmail()
      .isEmail()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    let body = req.body;
    let salt = pwd.genRandomString(16);
    let output = pwd.sha512(body.password, salt);
    try {
      let result = await userSchema.create({
        username: body.username,
        email: body.email,
        password: output,
        salt: salt
      });
      res.json({ data: userToDto(result) });
    } catch (err) {
      res.status(400).json({ errors: [err.message] });
    }
  });


module.exports = router;
