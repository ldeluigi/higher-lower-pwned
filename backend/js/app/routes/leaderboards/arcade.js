const express = require("express");
const mongoose = require("mongoose");
const { check, validationResult } = require("express-validator");
const score = require("../../model/score").schema;
const router = express.Router();

const DEFAULTLIMIT = 50;
const DEFAULTPERIOD = "week";

const periods = {
  day: minMaxDate((a) => new Date(a.getTime()).setDate(a.getUTCDate() - 1)),
  week: minMaxDate((a) => new Date(a.getTime()).setDate(a.getUTCDate() - 7)),
  month: minMaxDate((a) => new Date(a.getTime()).setMonth(a.getMonth() - 1)),
  year: minMaxDate((a) =>
    new Date(a.getTime()).setFullYear(a.getFullYear() - 1)
  ),
};

function minMaxDate(handleMin) {
  const today = new Date();
  const minDay = new Date(handleMin(today));
  return [minDay, today];
}

router.get("/arcade",[
  check("period")
  .optional({ nullable: true })
  .isIn(Object.keys(periods))
  .trim(),
check("limit")
  .optional({ nullable: true })
  .isInt({min: 1, max: 1000})
  .trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  var actualLimit = DEFAULTLIMIT;
  var actualPeriod = DEFAULTPERIOD;
  console.log(req.query);
  if (req.query.limit !== undefined) {
    actualLimit = req.query.limit;
    console.log("changing limit to " + actualLimit);
  }
  if (req.query.period !== undefined) {
    actualPeriod = req.query.period;
    console.log("changing period to " + actualPeriod);
  }
  const minMax = periods[actualPeriod];
  /*var result = await score.find(
    {"date":
      {
        "$gte": minMax(1),
        "$lte": minMax(0)
      }
    }).limit(limit)
    if (result === null) {
      return res.status(404).json({ errors: ["No leaderboards found"] });
    }
    res.json({ data: result });*/
  await res.json({ data: [minMax, actualLimit] }); // da eliminare
});

module.exports = router;
