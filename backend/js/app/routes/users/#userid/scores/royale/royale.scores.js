const express = require("express");
const router = express.Router();
const jwtTools = require("../../../../../utils/jwt");
const scoresHelper = require("../../../../../helpers/scores");


router.get(
  "/:userid/scores/royale",
  scoresHelper.guards,
  jwtTools.authentication(),
  scoresHelper.requestHandler(/^royale\.(win|lose)$/)
);

router.get(
  "/:userid/scores/royale/win",
  scoresHelper.guards,
  jwtTools.authentication(),
  scoresHelper.requestHandler(/^royale\.win$/)
);

router.get(
  "/:userid/scores/royale/lose",
  scoresHelper.guards,
  jwtTools.authentication(),
  scoresHelper.requestHandler(/^royale\.lose$/)
);

module.exports = router;
