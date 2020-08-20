const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const DEFAULTLIMIT = 50;
const DEFAULTPERIOD = "week";

const periods = {
  day: minMaxDate((a) => new Date(a.getTime()).setDate(a.getUTCDate() - 1)),
  week: minMaxDate((a) => new Date(a.getTime()).setDate(a.getUTCDate() - 7)),
  month: minMaxDate((a) => new Date(a.getTime()).setMonth(a.getMonth() - 1)),
  year: minMaxDate((a) =>
    new Date(a.getTime()).setFullYear(a.getFullYear() - 1)
  ),
};

function minMaxDate(handleMin) {
  const today = new Date();
  const minDay = new Date(handleMin(today));
  return [minDay, today];
}

function isLimitValid(limit) {
  return !isNaN(limit) && (limit >= 1 || limit <= 1000);
}

function isPeriodValid(period) {
  const validPeriod = periods.entries;
  return validPeriod.includes(period);
}

router.get("/arcade", (req, res) => {
  var actualLimit = DEFAULTLIMIT;
  var actualPeriod = DEFAULTPERIOD;
  console.log(req.params);
  if (req.params.limit !== undefined && isLimitValid(req.params.limit)) {
    actualLimit = req.params.limit;
    console.log("changing limit to " + actualLimit);
  }
  if (req.params.period != undefined && isPeriodValid(req.params.period)) {
    actualPeriod = req.params.period;
    console.log("changing period to " + actualPeriod);
  }
  //var Score = mongoose.model('Score', scoreSchema); // da creare lo scoreSchema
  const minMax = periods[actualPeriod];
  /*var result = Score.find(
    {"createdAt": //dovrebbe avere anche il capo date.. è utile?
      {
        "$gte": minMax(1),
        "$lte": minMax(0)
      }
    }).limit(limit)
    .then(scores => {res.json({data: scores})})
    .catch(err => {res.status(501).json({error: err})});// da controllare il codice di errore*/
  res.json({ data: [minMax, actualLimit] }); // da eliminare
});

module.exports = router;
