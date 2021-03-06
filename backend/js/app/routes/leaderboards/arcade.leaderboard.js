const express = require("express");
const router = express.Router();
const leaderboardHelper = require("../../helpers/leaderboards");

router.get(
  "/arcade",
  leaderboardHelper.guards,
  leaderboardHelper.requestHandler("arcade")
);

module.exports = router;
