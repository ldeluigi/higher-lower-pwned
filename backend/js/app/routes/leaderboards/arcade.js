const express = require("express");
const { validationResult, query } = require("express-validator");
const score = require("../../model/score").schema;
const router = express.Router();
const periodTools = require("../../helpers/period");
const limitTools = require("../../helpers/limit");

router.get(
  "/arcade",
  [periodTools.checkPeriod(query("period")), limitTools.checkLimit(query("limit"))],
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
          $gte: minMax[0],
          $lte: minMax[1],
        },
      })
      .limit(parseInt(actualLimit));
    if (result === null) {
      return res.status(404).json({ errors: ["No leaderboards found"] });
    }
    res.json({
      /*query: {
        date: {
          $gte: minMax[0],
          $lte: minMax[1],
        },
        limit: actualLimit,
      },*/ //oggetto di debug
      data: result,
    });
  }
);

module.exports = router;
