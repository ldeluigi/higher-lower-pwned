const express = require("express");
const router = express.Router();
const { query, validationResult, param } = require("express-validator");
const periodTools = require("../../utils/period");
const limitTools = require("../../utils/limit");
const jwtTools = require("../../utils/jwt");
const score = require("../../model/score").schema;
const mongoose = require("mongoose");

// page validato
let DEFAUL_PAGE = 0;

let checkPage = query("page")
  .optional({ nullable: true})
  .isInt({ min: 0 })
  .trim();

// score sort validator
let DEFAULT_SORTBY = "score";

let sortby = query("sortby")
  .optional({ nullable: true })
  .isAlphanumeric()
  .isIn(["score", "date"]);

// get scores for a user
router.get("/:userid/arcade",
  [
    param("userid")
      .notEmpty()
      .isAlphanumeric(),
    periodTools.checkPeriod,
    limitTools.checkLimit,
    checkPage,
    sortby
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
     //req.query.limit !== undefined ? req.query.limit : limitTools.DEFAULTLIMIT;
    var actualLimit = limitTools.DEFAULTLIMIT;
    var actualPeriod = periodTools.DEFAULTPERIOD;
    var actualPage = DEFAUL_PAGE;
    var actualSortby = DEFAULT_SORTBY
    if (req.query.limit !== undefined) {
      actualLimit = req.query.limit;
      console.log("changing limit to " + actualLimit);
    }
    if (req.query.period !== undefined) {
      actualPeriod = req.query.period;
      console.log("changing period to " + actualPeriod);
    }
    if (req.query.page !== undefined) {
      actualPage = req.query.page;
      console.log("changeing page to " + actualPage);
    }
    if (req.query.sortby !== undefined) {
      actualSortby = req.query.sortby
      console.log("changeing sortby to " + actualSortby)
    }

    // define the value on which sort the result, possible value: ["score", "start"]
    var sortValue = actualSortby === DEFAULT_SORTBY ? [["score", -1]] : [["start", 1]]

    // read data from DB
    try {
      var result = await score
        .find({
          "user": req.params.userid
        }).sort(sortValue)
    }
    catch {
      return res.status(404).json({ errors: ["No score found"] });
    }
    var firstValue = actualPage * actualLimit;
    var lastValue = (actualPage + 1) * actualLimit;
    result = result.splice(firstValue, lastValue)
    res.json({ data: result });
  }
)

module.exports = router;
