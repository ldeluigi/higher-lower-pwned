const express = require("express");
const router = express.Router();
const { validationResult, query } = require("express-validator");
const periodTools = require("../../helpers/period");
const score = require("../../model/score").schema;

router.get("/",
  [
    periodTools.checkPeriod(query("period"))
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const queryPeriod = req.query.period || periodTools.default;
    const statsBeginDate = periodTools.subtractPeriodNTimesFromToday(queryPeriod, 1);
    const totalDays = periodTools.periodsInDays(queryPeriod);

    try {
      let result = await score.aggregate([
        {
          $match: {
            end: {
              $gte: statsBeginDate,
              $lte: new Date()
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

          }
        },
        {
          $facet: {
            allTime: [
              {
                $group: {
                  _id: null,
                  maxScore: { $max: "$score" },
                  avgScore: { $avg: "$score" },
                  maxGuesses: { $max: "$guesses" },
                  avgGuesses: { $avg: "$guesses" },
                  maxDuration: { $max: { $subtract: ["$end", "$start"] } },
                  avgDuration: {
                    $avg: { $subtract: ["$end", "$start"] }
                  },
                }
              }
            ],
            byDay: [
              {
                $group: {
                  _id: {
                    day: "$day"
                  },
                  plays: { $sum: 1 }
                }
              },
              {
                $group: {
                  _id: null,
                  avgPlaysPerDay: { $avg: "$plays" },
                  maxPlaysPerDay: { $max: "$plays" }
                }
              }
            ]
          }
        },
        {
          $project: {
            avgScore: { $first: "$allTime.avgScore" },
            maxScore: { $first: "$allTime.maxScore" },
            avgGuesses: { $first: "$allTime.avgGuesses" },
            maxGuesses: { $first: "$allTime.maxGuesses" },
            avgDuration: { $first: "$allTime.avgDuration" },
            maxDuration: { $first: "$allTime.maxDuration" },
            avgPlaysPerDay: { $first: "$byDay.avgPlaysPerDay" },
            maxPlaysPerDay: { $first: "$byDay.maxPlaysPerDay" }
          }
        }
      ]);
      res.json({
        data: result[0]
      });
    } catch (err) {
      res.status(400).json({ errors: [err.message] });
    }
  }
);

module.exports = router;
