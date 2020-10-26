const express = require("express");
const router = express.Router();
const jwtTools = require("../../utils/jwt");
const scoresHelper = require("../../helpers/scores");


router.get(
  "/:userid/royale",
  scoresHelper.guards,
  jwtTools.authentication(),
  scoresHelper.requestHandler(/^royale\.(win|lose)$/)
);

module.exports = router;
