const express = require("express");
const router = express.Router({ mergeParams: true });
const jwtTools = require("../../../../utils/jwt");
const scoresHelper = require("../../../../helpers/scores");


router.get(
  "/arcade",
  scoresHelper.guards,
  jwtTools.authentication(),
  scoresHelper.requestHandler("arcade")
);

module.exports = router;
