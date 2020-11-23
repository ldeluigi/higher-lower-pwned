const { query, param, validationResult } = require("express-validator");
const score = require("../model/score.model");
const limitTools = require("./limit");

const scoreSortKey = "score"
const dateSortKey = "date"
const sortStrategies = [scoreSortKey, dateSortKey];

module.exports = {
  guards: [
    param("userid")
      .notEmpty()
      .isAlphanumeric(),
    limitTools.checkLimit(query("limit")),
    query("page").optional({ nullable: true }).trim().isInt({ min: 0 }),
    query("sortby").optional({ nullable: true }).trim().isIn(sortStrategies)
  ],
  requestHandler:
    /**
     * @param {String | RegExp} modeInDatabase
     */
    function (modeInDatabase) {
      return (async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        if (req.auth.id != req.params.userid) {
          return res.status(403).json({ errors: ["User not authorized."] });
        }
        try {
          const queryLimit = parseInt(req.query.limit) || limitTools.default;
          const queryPage = req.query.page || 0;
          const querySortStrategy = req.query.sortby;
          const userID = req.params.userid;
          let sortStrategy = {};
          switch (querySortStrategy) {
            case scoreSortKey:
              sortStrategy["score"] = -1;
              break;
            case dateSortKey:
              sortStrategy["end"] = -1;
              break;
            default:
              sortStrategy["score"] = -1;
          }
          const aggResult = await score.schema
            .aggregate([
              {
                $addFields: {
                  userId: { $toString: "$user" }
                }
              },
              {
                $match: {
                  mode: modeInDatabase,
                  userId: userID
                }
              }, {
                $facet: {
                  totalData: [
                    { $sort: sortStrategy },
                    { $skip: queryPage * queryLimit },
                    { $limit: queryLimit }
                  ],
                  totalCount: [
                    { $count: "count" }
                  ]
                }
              }]);
          if (aggResult === null) {
            return res.status(404).json({ errors: ["Score query error."] });
          }
          const result = aggResult[0];
          const totalCount = result.totalCount[0] ? result.totalCount[0].count : 0;
          const totalData = result.totalData;
          res.json({
            meta: {
              total: totalCount,
              page: queryPage,
              size: queryLimit
            },
            data: totalData.map(x => {
              let s = score.toDto(x);
              delete s.username;
              return s;
            })
          });
        } catch (err) {
          res.status(400).json({ errors: [err.message] });
        }
      });
    }
}
