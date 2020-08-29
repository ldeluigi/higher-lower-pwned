const express = require("express");
const router = express.Router();
const { query, validationResult, param } = require("express-validator");
const periodTools = require("../../helpers/period");
const limitTools = require("../../helpers/limit");
const score = require("../../model/score").schema;
const jwtTools = require("../../utils/jwt");

router.get("/:id/stats",
  [
    param("id")
      .notEmpty()
      .isAlphanumeric(),
    periodTools.checkPeriod(query("period")),
    limitTools.checkLimit(query("limit")),
  ],
  jwtTools.authentication(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    if (req.auth.id != req.params.id) {
      return res.status(403).json({ errors: ["User not authorized."] });
    }
    const actualLimit = limitTools.returnLimitFromReq(req);
    const actualPeriod = periodTools.returnPeriodFromReq(req);

    const validStartDateFrom = periodTools.subtractPeriodNTimesFromToday(actualPeriod, actualLimit);
    const periodDB = mapFromPeriodToDBPeriod[actualPeriod];

    const history = await score
      .aggregate([
        {
          $match: {
            $expr: {
              $and: [
                { $gte: ["$start", new Date(validStartDateFrom)] }, // filter only the valid date
                { user: req.param.id }
              ]
            }
          }
        },
        {
          $project: {
            day: { $dayOfYear: "$start" },
            week: { $week: "$start" },
            month: { $month: "$start" },
            year: { $year: "$start" },
            score: true,
            guesses: true,
            start: true,
            end: true,
            gameWidthOnPeriod: {
              $divide: // definisce quanto un game impatta sull'avg del gruppo
                [
                  1,
                  {
                    $divide: // get day count
                      [
                        { $subtract: [new Date().getTime(), datePeriodsTimeBackNTimes(actualPeriod, 1)] }, // get millisecond for every group
                        1000 * 24 * 60 * 60
                      ]
                  }
                ]
            }
          }
        },
        {
          $group: {
            _id: {
              periodNumber: periodDB,
              year: "$year"
            },
            AvgScore: { $avg: "$score" },
            AvgGuesses: { $avg: "$guesses" },
            AvgDuration: {
              $avg: { $subtract: ["$end", "$start"] }
            },
            avgPlaysPerDay: { $sum: "$gameWidthOnPeriod" }, // sum all the width to get the avg of the group
          }
        },
        {
          $project: {
            _id: null,
            periodNumber: "$_id.periodNumber",
            year: "$_id.year",
            AvgScore: "$AvgScore",
            AvgGuesses: "$AvgGuesses",
            AvgDuration: "$AvgDuration",
            avgPlaysPerDay: "$avgPlaysPerDay",
          }
        },
        {
          $sort: {
            year: -1,
            periodNumber: -1,
          }
        },
      ])
    const resultMaxValues = await score
      .aggregate([
        {
          $match: { $expr: { user: req.param.id } }
        },
        {
          $group: {
            _id: "group_max",
            maxScore: { $max: "$score" },
            maxGuesses: { $max: "$guesses" },
            maxDuration: { $max: { $subtract: ["$end", "$start"] } }
          }
        }
      ]);
    history.forEach(function (v) { delete v._id });
    var maxScore = 0;
    var maxGuesses = 0;
    var maxDuration = 0;
    if (resultMaxValues.length > 0) {
      maxScore = resultMaxValues[0].maxScore;
      maxGuesses = resultMaxValues[0].maxGuesses;
      maxDuration = resultMaxValues[0].maxDuration;
    }
    res.json({
      data: {
        maxScore,
        maxGuesses,
        maxDuration,
        history,
      }
    })
  }
);

const mapFromPeriodToDBPeriod = {
  day: "$day",
  week: "$week",
  month: "$month",
  year: "$year",
};

const mapFromPeriodToDaysNumber = {
  day: 1,
  week: 7,
  month: 30,
  year: 365,
};

module.exports = router;
