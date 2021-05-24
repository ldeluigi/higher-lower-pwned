const { validationResult, query } = require("express-validator");
const periodTools = require("./period");
const score = require("../model/score.model").schema;

module.exports = {
  guards: [
    periodTools.checkPeriod(query("period"))
  ],
  requestHandler: function (modeInDatabase) {
    return (async (req, res) => {
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
              mode: modeInDatabase || /[\s\S]*/,
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
            },
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
                      $avg: { $subtract: ["$end", "$start"] },
                    },
                    plays: { $sum: 1 }
                  },
                },
              ],
              byDay: [
                {
                  $group: {
                    _id: {
                      day: "$day",
                    },
                    plays: { $sum: 1 },
                  },
                },
                {
                  $group: {
                    _id: null,
                    avgPlaysPerDay: { $avg: "$plays" },
                    maxPlaysPerDay: { $max: "$plays" },
                  },
                },
              ],
            },
          },
          {
            $project: {
              avgScore: { $ifNull: [{ $first: "$allTime.avgScore" }, 0] },
              maxScore: { $ifNull: [{ $first: "$allTime.maxScore" }, 0] },
              avgGuesses: { $ifNull: [{ $first: "$allTime.avgGuesses" }, 0] },
              maxGuesses: { $ifNull: [{ $first: "$allTime.maxGuesses" }, 0] },
              avgDuration: { $ifNull: [{ $first: "$allTime.avgDuration" }, 0] },
              maxDuration: { $ifNull: [{ $first: "$allTime.maxDuration" }, 0] },
              avgPlaysPerDay: {
                $divide: [{
                  $ifNull: [
                    {
                      $first: "$allTime.plays"
                    },
                    0
                  ]
                }, totalDays]
              },
              maxPlaysPerDay: { $ifNull: [{ $first: "$byDay.maxPlaysPerDay" }, 0] },
            },
          },
        ]);
        res.json({
          data: result[0],
        });
      } catch (err) {
        res.status(400).json({ errors: [err.message] });
      }
    });
  }
}
