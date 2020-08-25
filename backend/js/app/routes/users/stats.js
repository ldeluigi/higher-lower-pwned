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

    const validStartDateFrom = datePeriodsTimeBackNTimes(actualPeriod, actualLimit);
    const period =  mapFromPeriodToDBPeriod[actualPeriod];
    const resultHistory = await score
      .aggregate([
        {
          $match: {
            $expr:{
              $gte: [ "$start", new Date(validStartDateFrom)]}
            }
        },
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
            "avgPlaysPerDay": { $divide :
              [
                1,
                { $divide:
                  [
                    { $subtract: [new Date().getTime(), datePeriodsTimeBackNTimes(actualPeriod, 1)]},
                    1000 * 24 * 60 * 60
                  ]
                }
              ]}
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
        },
        {
          $sort: {
            "year": -1,
            "periodNumber": -1
          }
        }
      ]).limit(parseInt(actualLimit))
      const resultMaxScore = await score
        .findOne()
        .sort([["score", -1]])
      const resultMaxGuesses = await score
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
        maxGuesses: resultMaxGuesses.guesses,
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

function datePeriodsTimeBackNTimes(period, times) {
  if (!Object.keys(periods).includes(period)) throw new Error("Invalid Period")
  if (times <= 0) throw new Error("Invalid times")
  let currentDate = new Date()
  let p = {
    day: new Date().setDate(currentDate.getUTCDate() - 1*times),
    week: new Date().setDate(currentDate.getUTCDate() - 7*times),
    month: new Date().setMonth(currentDate.getMonth() - 1*times),
    year:  new Date().setFullYear(currentDate.getFullYear() - 1*times)
  };
  return p[period]
}

module.exports = router;
