const express = require("express");
const { query, param, validationResult } = require("express-validator");
const score = require("../../model/score").schema;
const router = express.Router();
const periodTools = require("../../helpers/period");
const limitTools = require("../../helpers/limit");
const jwtTools = require("../../utils/jwt");

const valueScore = "score"
const valueDate = "date"
const valueScoreInDB = "score"
const valueDateInDB = "start"
const sortable = [valueScore, valueDate];

router.get(
  "/:userid/arcade",
  [
    periodTools.checkPeriod,
    limitTools.checkLimit,
    query("page").optional({ nullable: true }).isInt({ min: 0 }).trim(),
    query("sortby").optional({ nullable: true }).isIn(sortable).trim(),
    param("userid")
      .notEmpty()
      .isAlphanumeric(),
  ],
  jwtTools.authentication(),
  async (req, res) => {
    const errors = validationResult(req);
    if (req.auth.id != req.params.userid) {
      console.log(req.auth.id);
      return res.status(403).json({ errors: ["User not authorized."] });
    }
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const actualLimit = limitTools.returnLimitFromReq(req);
      const actualPeriod = periodTools.returnPeriodFromReq(req);
      const minMax = periodTools.periods[actualPeriod];
      const actualPage = genericTools.getOrElse(req.query.page, 0);
      const actualSortby = genericTools.getOrElse(req.query.sortby, valueScore);
      const sortValue = actualSortby === valueScore ? [[valueScoreInDB, -1]] : [[valueDateInDB, 1]]
      const result = await score
        .find({
          start: {
            $gte: minMax[0],
            $lte: minMax[1]
          },
          user: req.params.userid
        })
        .skip(actualPage * actualLimit)
        .limit(parseInt(actualLimit))
        .sort(sortValue);
      if (result === null) {
        return res.status(404).json({ errors: ["No leaderboards found"] });
      }
      res.json({ data: result });
    } catch (err) {
      res.status(400).json({ errors: [err.message] });
    }
  }
);

module.exports = router;
