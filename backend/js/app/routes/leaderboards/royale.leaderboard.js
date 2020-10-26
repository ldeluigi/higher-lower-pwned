const express = require("express");
const router = express.Router();
const leaderboardHelper = require("../../helpers/leaderboards");

router.get(
  "/royale",
  leaderboardHelper.guards,
  leaderboardHelper.requestHandler(/^royale\.(win|lost)$/)
);

module.exports = router;
