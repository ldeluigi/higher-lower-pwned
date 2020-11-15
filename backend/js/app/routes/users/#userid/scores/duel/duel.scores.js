const express = require("express");
const router = express.Router();
const jwtTools = require("../../../../../utils/jwt");
const scoresHelper = require("../../../../../helpers/scores");


router.get(
  "/",
  scoresHelper.guards,
  jwtTools.authentication(),
  scoresHelper.requestHandler(/^duel\.(win|lose)$/)
);

router.get(
  "/win",
  scoresHelper.guards,
  jwtTools.authentication(),
  scoresHelper.requestHandler(/^duel\.win$/)
);

router.get(
  "/lose",
  scoresHelper.guards,
  jwtTools.authentication(),
  scoresHelper.requestHandler(/^duel\.lose$/)
);

module.exports = router;
