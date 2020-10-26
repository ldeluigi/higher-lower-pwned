const express = require("express");
const router = express.Router();
const statsHelper = require("../../../helpers/stats");

router.get(
  "/",
  statsHelper.guards,
  statsHelper.requestHandler(/^duel\.(win|lose)$/)
);

router.get(
  "/win",
  statsHelper.guards,
  statsHelper.requestHandler(/^duel\.win$/)
);

router.get(
  "/lose",
  statsHelper.guards,
  statsHelper.requestHandler(/^duel\.lose$/)
);
module.exports = router;
