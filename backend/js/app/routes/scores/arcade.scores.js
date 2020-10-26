const express = require("express");
const router = express.Router();
const jwtTools = require("../../utils/jwt");
const scoresHelper = require("../../helpers/scores");


router.get(
  "/:userid/arcade",
  scoresHelper.guards,
  jwtTools.authentication(),
  scoresHelper.requestHandler("arcade")
);

module.exports = router;
