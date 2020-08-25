const express = require("express");
const router = express.Router();
const { body, validationResult, param } = require("express-validator");
const periodTools = require("../../utils/period");
const limitTools = require("../../utils/limit");
const { periods } = require("../../utils/period");
const score = require("../../model/score").schema;
const jwtTools = require("../../utils/jwt");

router.get("/:id/stats",
  [
    param("id")
      .notEmpty()
      .isAlphanumeric(),
      periodTools.checkPeriod,
      limitTools.checkLimit
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
    const minMax = periodTools.periods[actualPeriod];

    const totalDate = actualPeriod * actualLimit // tempo che devo andare indietro
    const period =  mapFromPeriodToDBPeriod[actualPeriod]
    const resultHistory = await score
      .aggregate([
        {
          "$project": {
            "day": { "$dayOfYear": "$start" },
            "week": { "$week" : "$start" },
            "month": { "$month": "$start" },
            "year": { "$year": "$start" },
            "score": 1,
            "guesses": 1,
            "start": 1,
            "end": 1,
            "avgPlaysPerDay": { $divide : [1, mapFromPeriodToDaysNumber[actualPeriod]]}
          }
        },
        {
          $group: {
            "_id": {
              "periodNumber": period,
              "year": "$year"
            },
            "AvgScore": { $avg: "$score"},
            "AvgGuesses": { $avg: "$guesses"},
            "AvgDuration": {
              $avg: { $subtract: ["$end", "$start"]}
            },
            "avgPlaysPerDay": { $sum: "$avgPlaysPerDay" }
          }
        },
        {
          $project: {
            "_id": null,
            "periodNumber": "$_id.periodNumber",
            "year": "$_id.year",
            "AvgScore": "$AvgScore",
            "AvgGuesses": "$AvgGuesses",
            "AvgDuration": "$AvgDuration",
            "avgPlaysPerDay": "$avgPlaysPerDay"
          }
        }
      ]).limit(parseInt(actualLimit))
      const resultMaxScore = await score
        .findOne()
        .sort([["score", -1]])
      const resultMaxSGuesses = await score
        .findOne()
        .sort([["guesses", -1]])
      const resultMaxDuration = await score
        .aggregate([
          {
            $project: {
              status_count: {
                $subtract: ["$end", "$start"]
              }
            }
          },
          {
            $sort: { status_count: -1 }
          },
          { $limit: 1 },
          {
            $project: {
              "_id": "$status_count"
            }
          }
        ])
      res.json({
        maxScore: resultMaxScore.score,
        maxSGuesses: resultMaxSGuesses.guesses,
        maxDuration: resultMaxDuration[0]._id,
        history: resultHistory
      })
  }
)

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
