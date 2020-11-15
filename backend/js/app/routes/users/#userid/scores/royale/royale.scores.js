const express = require("express");
const router = express.Router({ mergeParams: true });
const jwtTools = require("../../../../../utils/jwt");
const scoresHelper = require("../../../../../helpers/scores");


router.get(
  "/",
  scoresHelper.guards,
  jwtTools.authentication(),
  scoresHelper.requestHandler(/^royale\.(win|lose)$/)
);

router.get(
  "/win",
  scoresHelper.guards,
  jwtTools.authentication(),
  scoresHelper.requestHandler(/^royale\.win$/)
);

router.get(
  "/lose",
  scoresHelper.guards,
  jwtTools.authentication(),
  scoresHelper.requestHandler(/^royale\.lose$/)
);

module.exports = router;
