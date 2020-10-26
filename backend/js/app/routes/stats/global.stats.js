const express = require("express");
const router = express.Router();
const statsHelper = require("../../helpers/stats");

router.get(
  "/",
  statsHelper.guards,
  statsHelper.requestHandler()
);

module.exports = router;
