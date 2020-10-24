const express = require("express");
const router = express.Router();
const { validationResult, query } = require("express-validator");
const periodTools = require("../../helpers/period");
const score = require("../../model/score").schema;

router.get(
  "/",
  [periodTools.checkPeriod(query("period"))],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const queryPeriod = req.query.period || periodTools.default;
    const statsBeginDate = periodTools.subtractPeriodNTimesFromToday(
      queryPeriod,
      1
    );
    const totalDays = periodTools.periodsInDays(queryPeriod);

    try {
      let result = await score.aggregate([
        {
          $match: {
            end: {
              $gte: statsBeginDate,
              $lte: new Date(),
            },
          },
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
            mode: true
          },
        },
        {
          $facet: {
            allTime: [
              {
                $group: {
                  _id: "$mode",
                  maxScore: { $max: "$score" },
                  avgScore: { $avg: "$score" },
                  maxGuesses: { $max: "$guesses" },
                  avgGuesses: { $avg: "$guesses" },
                  maxDuration: { $max: { $subtract: ["$end", "$start"] } },
                  avgDuration: {
                    $avg: { $subtract: ["$end", "$start"] },
                  },
                  plays: { $sum: 1 }
                },
              },
              {
                $sort: {
                  _id: 1
                }
              }
            ],
            byDay: [
              {
                $group: {
                  _id: {
                    mode: "$mode",
                    day: "$day",
                  },
                  plays: { $sum: 1 },
                },
              },
              {
                $group: {
                  _id: "$_id.mode",
                  avgPlaysPerDay: { $avg: "$plays" },
                  maxPlaysPerDay: { $max: "$plays" },
                },
              },
              {
                $sort: {
                  _id: 1
                }
              },
            ],
          },
        },
        {
          $project: {
            everything: {
              $zip: {
                inputs: ["$allTime", "$byDay"]
              }
            }
          }
        },
        {
          $unwind: "$everything"
        },
        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: "$everything"
            }
          }
        }
      ]);
      res.json({
        data: result,
      });
    } catch (err) {
      res.status(400).json({ errors: [err.message] });
    }
  }
);

module.exports = router;
