const express = require("express");
const router = express.Router();
const { validationResult } = require("express-validator");
const periodTools = require("../../utils/period");
const { datePeriodsTimeBackNTimes } = require("../../utils/period");
const score = require("../../model/score").schema;

router.get("/",
  [
    periodTools.checkPeriod
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const actualPeriod = periodTools.returnPeriodFromReq(req);
    const validStartDateFrom = datePeriodsTimeBackNTimes(actualPeriod, 1);
    const totalDays = (new Date().getTime() - new Date(validStartDateFrom).getTime()) / (1000 * 60 * 60 * 24);

    const dateFilter = {
      $match: {
        $expr: {
          $gte: ["$start", new Date(validStartDateFrom)]
        }
      }
    };

    const resultPlaysPerDay = await score
      .aggregate([
        dateFilter,
        {
          $project: {
            day: { $dayOfYear: "$start" },
          }
        },
        {
          $group: {
            _id: "$day",
            gamePlayed: { $sum: 1 },
          }
        },
        {
          $group: {
            _id: "group_id",
            maxPlaysPerDay: { $max: "$gamePlayed" },
          }
        }
      ]);

    const result = await score
      .aggregate([
        dateFilter,
        {
          $group: {
            _id: "group_id",
            avgScore: { $avg: "$score" },
            avgGuesses: { $avg: "$guesses" },
            avgDuration: { $avg: { $subtract: ["$end", "$start"] } },
            gamePlayed: { $sum: 1 },
            maxScore: { $max: "$score" },
            maxGuesses: { $max: "$guesses" },
            maxDuration: { $max: { $subtract: ["$end", "$start"] } },
          }
        }
      ]);

    if (result.length <= 0 || resultPlaysPerDay.length <= 0) {
      return res.json({
        avgScore: 0,
        maxScore: 0,
        avgGuesses: 0,
        maxGuesses: 0,
        avgPlaysPerDay: 0,
        maxPlaysPerDay: 0,
        avgDuration: 0,
        maxDuration: 0,
      });
    }
    res.json({
      avgScore: result[0].avgScore,
      maxScore: result[0].maxScore,
      avgGuesses: result[0].avgGuesses,
      maxGuesses: result[0].maxGuesses,
      avgPlaysPerDay: (result[0].gamePlayed / totalDays),
      maxPlaysPerDay: resultPlaysPerDay[0].maxPlaysPerDay,
      avgDuration: result[0].avgDuration,
      maxDuration: result[0].maxDuration,
    })
  }
);

module.exports = router;
