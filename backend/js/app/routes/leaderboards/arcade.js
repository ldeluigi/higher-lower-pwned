const express = require("express");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const score = require("../../model/score").schema;
const router = express.Router();
const periodTools = require("../../utils/period");
const limitTools = require("../../utils/limit");

router.get(
  "/arcade",
  [periodTools.checkPeriod, limitTools.checkLimit],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    console.log(req.query);
    const actualLimit = limitTools.returnLimitFromReq(req);
    const actualPeriod = periodTools.returnPeriodFromReq(req);
    const minMax = periodTools.periods[actualPeriod];
    const result = await score
      .find({
        date: {
          $gte: minMax[1],
          $lte: minMax[0],
        },
      })
      .limit(parseInt(actualLimit));
    if (result === null) {
      return res.status(404).json({ errors: ["No leaderboards found"] });
    }
    res.json({ data: result });
  }
);

module.exports = router;
