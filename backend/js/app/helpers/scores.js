const { query, param, validationResult } = require("express-validator");
const score = require("../model/score").schema;
const periodTools = require("./period");
const limitTools = require("./limit");

const scoreSortKey = "score"
const dateSortKey = "date"
const sortStrategies = [scoreSortKey, dateSortKey];

module.exports = {
  guards: [
    param("userid")
      .notEmpty()
      .isAlphanumeric(),
    periodTools.checkPeriod(query("period")),
    limitTools.checkLimit(query("limit")),
    query("page").optional({ nullable: true }).trim().isInt({ min: 0 }),
    query("sortby").optional({ nullable: true }).trim().isIn(sortStrategies)
  ],
  requestHandler: function (modeInDatabase) {
    return (async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      if (req.auth.id != req.params.userid) {
        return res.status(403).json({ errors: ["User not authorized."] });
      }
      try {
        const queryLimit = req.query.limit || limitTools.default;
        const queryPeriod = req.query.period || periodTools.default;
        const periodMinMax = periodTools.periods[queryPeriod];
        const queryPage = req.query.page || 0;
        const querySortStrategy = req.query.sortby;
        const userID = req.params.userid;
        let sortStrategy = {};
        switch (querySortStrategy) {
          case scoreSortKey:
            sortStrategy["score"] = "desc";
            break;
          case dateSortKey:
            sortStrategy["end"] = "desc";
            break;
          default:
            sortStrategy["score"] = "desc";
        }
        const result = await score
          .find({
            end: {
              $gte: periodMinMax[0],
              $lte: periodMinMax[1]
            },
            mode: modeInDatabase,
            user: userID
          })
          .skip(queryPage * queryLimit)
          .limit(parseInt(queryLimit))
          .sort(sortStrategy);
        if (result === null) {
          return res.status(404).json({ errors: ["Score query error."] });
        }
        res.json({ data: result });
      } catch (err) {
        res.status(400).json({ errors: [err.message] });
      }
    });
  }
}