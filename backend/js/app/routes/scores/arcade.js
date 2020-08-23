const express = require("express");
const { query, param, validationResult } = require("express-validator");
const score = require("../../model/score").schema;
const router = express.Router();
const periodTools = require("../../utils/period");
const limitTools = require("../../utils/limit");
const jwtTools = require("../../utils/jwt");
const genericTools = require("../../utils/generic");

const sortable = ["score", "date"];

router.get(
  "/:userid/arcade",
  [
    periodTools.checkPeriod,
    limitTools.checkLimit,
    query("page").optional({ nullable: true }).isInt({ min: 0 }).trim(),
    query("sortBy").optional({ nullable: true }).isIn(sortable).trim(),
    //jwtTools.headerJWT,
    param("userid") /*todo*/
      .trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const actualLimit = limitTools.returnLimitFromReq(req);
    const actualPeriod = periodTools.returnPeriodFromReq(req);
    const minMax = periodTools.periods[actualPeriod];
    const actualPage = genericTools.getOrElse(req.query.page, 0);
    const actualSortBy = genericTools.getOrElse(req.query.sortBy, "score");
    const result = await score
      .find({
        date: {
          $gte: minMax[1],
          $lte: minMax[0],
        },
        user: req.params.userid,
      })
      .limit(parseInt(actualLimit))
      .skip(actualPage * actualLimit)
      .sort(actualSortBy);
    if (result === null) {
      return res.status(404).json({ errors: ["No leaderboards found"] });
    }
    res.json({ data: result });
  }
);

module.exports = router;
