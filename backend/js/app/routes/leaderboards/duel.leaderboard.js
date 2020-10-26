const express = require("express");
const router = express.Router();
const leaderboardHelper = require("../../helpers/leaderboards");

router.get(
  "/duel",
  leaderboardHelper.guards,
  leaderboardHelper.requestHandler(/^duel\.(win|lost)$/)
);

module.exports = router;
