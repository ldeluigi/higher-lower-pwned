const express = require("express");
const router = express.Router();
const statsHelper = require("../../../helpers/stats");

router.get(
  "/",
  statsHelper.guards,
  statsHelper.requestHandler(/^royale\.(win|lose)$/)
);

router.get(
  "/win",
  statsHelper.guards,
  statsHelper.requestHandler(/^royale\.win$/)
);

router.get(
  "/lose",
  statsHelper.guards,
  statsHelper.requestHandler(/^royale\.lose$/)
);
module.exports = router;
