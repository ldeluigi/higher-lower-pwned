const express = require("express");
const router = express.Router();
const statsHelper = require("../../helpers/stats");

router.get(
  "/duel",
  statsHelper.guards,
  statsHelper.requestHandler(/^duel\.(win|lose)$/)
);

router.get(
  "/duel/win",
  statsHelper.guards,
  statsHelper.requestHandler(/^duel\.win$/)
);

router.get(
  "/duel/lose",
  statsHelper.guards,
  statsHelper.requestHandler(/^duel\.lose$/)
);
module.exports = router;
