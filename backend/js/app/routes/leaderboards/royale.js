const express = require("express");
const router = express.Router();
const leaderboardHelper = require("../../helpers/leaderboard");

router.get(
  "/royale",
  leaderboardHelper.guards,
  leaderboardHelper.requestHandler(/^royale\.(win|lost)$/)
);

module.exports = router;
