const express = require("express");
const router = express.Router();
const { body, validationResult, param } = require("express-validator");
const userSchema = require("../../model/user").schema;
const userToDto = require("../../model/user").toDto;
const pwd = require("../../utils/password");
const jwtTools = require("../../utils/jwt");

router.post("/",
  [
    body("username")
      .notEmpty()
      .isAlphanumeric()
      .trim(),
    body("password")
      .isAlphanumeric()
      .trim()
      .isLength({ min: 8, max: 1024 }),
    body("email")
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

router.get("/:id",
  [param("id")
    .notEmpty()
    .isAlphanumeric()],
  jwtTools.authentication(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    if (req.auth.id != req.params.id) {
      return res.status(403).json({ errors: ["User not authorized."] });
    }
    try {
      let userQuery = await userSchema.findById(req.params.id);
      if (userQuery === null) {
        return res.status(404).json({ errors: ["User not found."] });
      }
      res.json({ data: userToDto(userQuery) });
    } catch (err) {
      res.status(400).json({ errors: [err.message] });
    }
  });

router.put("/:id",
  [param("id")
    .notEmpty()
    .isAlphanumeric(),
  body("password")
    .optional({ nullable: true })
    .isAlphanumeric()
    .trim()
    .isLength({ min: 8, max: 1024 }),
  body("email")
    .optional({ nullable: true })
    .normalizeEmail()
    .isEmail()],
  jwtTools.authentication(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    if (req.auth.id != req.params.id) {
      return res.status(403).json({ errors: ["User not authorized."] });
    }
    let newPassword = req.body.password;
    let passwordUpdated = false;
    let newEmail = req.body.email;
    try {
      let userQuery = await userSchema.findById(req.params.id);
      if (userQuery === null) {
        return res.status(404).json({ errors: ["User not found."] });
      }
      if (newPassword !== undefined) {
        let salt = pwd.genRandomString(16);
        let output = pwd.sha512(newPassword, salt);
        userQuery.password = output;
        userQuery.salt = salt;
        passwordUpdated = true;
      }
      if (newEmail !== undefined) {
        userQuery.email = newEmail;
      }
      await userQuery.save();
      let result = userToDto(userQuery);
      result.password = passwordUpdated ? "updated" : "unchanged";
      res.json({ data: result });
    } catch (err) {
      res.status(400).json({ errors: [err.message] });
    }
  });


module.exports = router;
