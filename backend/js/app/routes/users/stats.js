const express = require("express");
const router = express.Router();
const { query, validationResult, param } = require("express-validator");
const periodTools = require("../../helpers/period");
const score = require("../../model/score").schema;
const jwtTools = require("../../utils/jwt");

router.get("/:id/stats",
  [
    param("id")
      .notEmpty()
      .isAlphanumeric(),
    periodTools.checkPeriod(query("period")),
    query("limit")
      .optional({ nullable: true })
      .trim()
      .isInt({ min: 1, max: 30 })
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
    try {
      let queryLimit = req.query.limit || 10;
      let queryPeriod = req.query.period || periodTools.default;

      let validStartDateFrom = periodTools.subtractPeriodNTimesFromToday(queryPeriod, queryLimit);
      let periodGroupDB = mapFromPeriodToDBPeriod[queryPeriod];

      let userID = req.param.id;

      const history = await score
        .aggregate([
          {
            $match: {
              $expr: {
                $and: [
                  { $gte: ["$end", validStartDateFrom] }, // filter only the valid date
                  { user: userID }
                ]
              }
            }
          },
          {
            $project: {
              day: { $dayOfYear: "$end" },
              week: { $week: "$end" },
              month: { $month: "$end" },
              year: { $year: "$end" },
              score: true,
              guesses: true,
              start: true,
              end: true,
              playsPerDayFraction: {
                $divide: // this one match on the whole period, as fraction, for the average
                  [
                    1,
                    periodTools.periodsInDays(queryPeriod)
                  ]
              }
            }
          },
          {
            $group: {
              _id: {
                periodNumber: periodGroupDB,
                year: "$year"
              },
              maxScore: { $max: "$score" },
              avgScore: { $avg: "$score" },
              maxGuesses: { $max: "$guesses" },
              avgGuesses: { $avg: "$guesses" },
              maxDuration: { $max: { $subtract: ["$end", "$start"] } },
              avgDuration: {
                $avg: { $subtract: ["$end", "$start"] }
              },
              avgPlaysPerDay: { $sum: "$playsPerDayFraction" }, // sum all fractions to get the avg of the group
            }
          },
          {
            $project: {
              _id: false,
              periodNumber: "$_id.periodNumber",
              year: "$_id.year",
              avgScore: true,
              avgGuesses: true,
              avgDuration: true,
              avgPlaysPerDay: true,
              maxScore: true,
              maxGuesses: true,
              maxDuration: true
            }
          },
          {
            $sort: {
              year: -1,
              periodNumber: -1,
            }
          },
        ]);
      //history.forEach((v) => { delete v._id });
      res.json({
        data: {
          id: userID,
          history: history
        }
      });
    } catch (err) {
      res.status(400).json({ errors: [err.message] });
    }
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
