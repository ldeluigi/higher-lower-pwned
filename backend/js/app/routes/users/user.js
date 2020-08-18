const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const user = require("../../model/user").schema;
const userToDto = require("../../model/user").toDto;
const crypto = require('crypto');

function genRandomString(length) {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex') /** convert to hexadecimal format */
    .slice(0, length);   /** return required number of characters */
};

function sha512(password, salt) {
  let hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
  hash.update(password);
  let value = hash.digest('hex');
  return {
    salt: salt,
    hash: value
  };
};

router.post("/",
  [
    check("username")
      .notEmpty()
      .bail()
      .isAlphanumeric()
      .bail()
      .trim(),
    check("password")
      .notEmpty()
      .bail()
      .isAlphanumeric()
      .bail()
      .isLength({ min: 8, max: 1024 })
      .bail()
      .trim(),
    check("email")
      .notEmpty()
      .bail()
      .normalizeEmail()
      .bail()
      .isEmail()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    let body = req.body;
    let salt = genRandomString(16);
    let output = sha512(body.password, salt);
    // TODO manage error message
    try {
      let result = await user.create({
        username: body.username,
        email: body.email,
        password: output.hash,
        salt: output.salt
      });
      res.json({ data: userToDto(result) });
    } catch (err) {
      res.status(400).json({ errors: err });
    }

  });

module.exports = router;
