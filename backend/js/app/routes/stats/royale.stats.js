const express = require("express");
const router = express.Router();
const statsHelper = require("../../helpers/stats");

router.get(
  "/royale",
  statsHelper.guards,
  statsHelper.requestHandler(/^royale\.(win|lose)$/)
);

router.get(
  "/royale/win",
  statsHelper.guards,
  statsHelper.requestHandler(/^royale\.win$/)
);

router.get(
  "/royale/lose",
  statsHelper.guards,
  statsHelper.requestHandler(/^royale\.lose$/)
);
module.exports = router;
