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
    var actualLimit = limitTools.DEFAULTLIMIT;
    var actualPeriod = periodTools.DEFAULTPERIOD;
    console.log(req.query);
    if (req.query.limit !== undefined) {
      actualLimit = req.query.limit;
      console.log("changing limit to " + actualLimit);
    }
    if (req.query.period !== undefined) {
      actualPeriod = req.query.period;
      console.log("changing period to " + actualPeriod);
    }
    const minMax = periodTools.periods[actualPeriod];
    var result = await score
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
