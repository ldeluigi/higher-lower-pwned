const express = require("express");
const router = express.Router();
const jwtTools = require("../../utils/jwt");
const scoresHelper = require("../../helpers/scores");


router.get(
  "/:userid/duel",
  scoresHelper.guards,
  jwtTools.authentication(),
  scoresHelper.requestHandler(/^duel\.(win|lose)$/)
);

module.exports = router;
