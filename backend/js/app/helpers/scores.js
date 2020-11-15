const { query, param, validationResult } = require("express-validator");
const score = require("../model/score.model");
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
              sortStrategy["score"] = "desc";
              break;
            case dateSortKey:
              sortStrategy["end"] = "desc";
              break;
            default:
              sortStrategy["score"] = "desc";
          }
          const result = await score.schema
            .aggregate([{
              $match: {
                mode: modeInDatabase,
                user: userID
              }
            }, {
              $facet: {
                totalData: [
                  { $skip: queryPage * queryLimit },
                  { $limit: queryLimit },
                  { $sort: sortStrategy }
                ],
                totalCount: [
                  { $count: "count" }
                ]
              }
            }]);
          if (result === null) {
            return res.status(404).json({ errors: ["Score query error."] });
          }
          res.json({
            meta: {
              total: result.totalCount,
              page: queryPage,
              size: queryLimit
            },
            data: result.totalData.map(x => {
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
