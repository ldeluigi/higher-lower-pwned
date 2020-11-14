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

router.get(
  "/:userid/duel/win",
  scoresHelper.guards,
  jwtTools.authentication(),
  scoresHelper.requestHandler(/^duel\.win$/)
);

router.get(
  "/:userid/duel/lose",
  scoresHelper.guards,
  jwtTools.authentication(),
  scoresHelper.requestHandler(/^duel\.lose$/)
);

module.exports = router;
