const express = require("express");
const router = express.Router();
const { body, validationResult, param } = require("express-validator");
const userSchema = require("../../model/user.model").schema;
const userToDto = require("../../model/user.model").toDto;
const pwd = require("../../utils/password");
const jwtTools = require("../../utils/jwt");
const mailService = require("../../utils/mail-service");
const tokenSchema = require("../../model/token.model").schema;
const scoreSchema = require("../../model/score.model").schema;
const battle = require("../../game/battle");
const arcade = require("../../game/arcade");


router.post("/",
  [
    body("username")
      .notEmpty()
      .isAlphanumeric()
      .trim()
      .isLength({ min: 4, max: 30 })
      .customSanitizer(value => value.toLowerCase()),
    body("password")
      .isAscii()
      .trim()
      .isLength({ min: 8, max: 1024 }),
    body("email")
      .notEmpty()
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
    let output = pwd.hash(body.password, salt);
    try {
      let sameUsername = await userSchema.findOne({
        username: body.username
      });
      if (sameUsername !== null) {
        throw new Error("Username already taken.");
      }
      let sameEmail = await userSchema.findOne({
        email: body.email
      });
      if (sameEmail !== null) {
        throw new Error("Email already used.");
      }
      await mailService.sendSubscriptionEmail(body.email, body.username);
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
    if (req.auth.sub != req.params.id) {
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
    .isAscii()
    .trim()
    .isLength({ min: 8, max: 1024 }),
  body("oldPassword")
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
    if (req.auth.sub != req.params.id) {
      return res.status(403).json({ errors: ["User not authorized."] });
    }
    let newPassword = req.body.password;
    let oldPassword = req.body.oldPassword;
    let passwordUpdated = false;
    let newEmail = req.body.email;
    try {
      let userQuery = await userSchema.findById(req.params.id);
      if (userQuery === null) {
        return res.status(404).json({ errors: ["User not found."] });
      }
      if (newPassword !== undefined) {
        if (oldPassword === undefined) {
          return res.status(400).json({ errors: ["Old password not specified."] });
        }
        let oldPasswordHash = pwd.hash(oldPassword, userQuery.salt);
        if (oldPasswordHash !== userQuery.password) {
          return res.status(400).json({ errors: ["Wrong credentials."] });
        }
        let salt = pwd.genRandomString(16);
        let output = pwd.hash(newPassword, salt);
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

router.delete("/:id",
  [param("id")
    .notEmpty()
    .isAlphanumeric()],
  jwtTools.authentication(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    if (req.auth.sub != req.params.id) {
      return res.status(403).json({ errors: ["User not authorized."] });
    }
    try {
      let userQuery = await userSchema.findByIdAndDelete(req.params.id);
      if (userQuery === null) {
        return res.status(404).json({ errors: ["User not found."] });
      }
      await battle.deleteUser(userQuery._id.toString());
      await arcade.deleteUser(userQuery._id.toString());
      await scoreSchema.deleteMany({
        user: userQuery._id
      });
      await tokenSchema.deleteMany({
        user: userQuery._id
      });
      let result = userToDto(userQuery);
      res.json({ data: result });
    } catch (err) {
      res.status(400).json({ errors: [err.message] });
    }
  });

module.exports = router;
