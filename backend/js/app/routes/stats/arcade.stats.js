const express = require("express");
const router = express.Router();
const statsHelper = require("../../helpers/stats");

router.get(
  "/arcade",
  statsHelper.guards,
  statsHelper.requestHandler("arcade")
);

module.exports = router;
