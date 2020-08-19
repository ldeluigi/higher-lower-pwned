const express = require("express");
const router = express.Router();

const DEFAULTLIMIT = 50;
const DEFAULTPERIOD = "week";
function minMaxDate(handleMin){
  const today = new Date()
  return [handleMin(today), today]
}

const periods = new Map([
  {"day": minMaxDate(a => a - 1)},
  {"week": minMaxDate(a => a - 7)},
  {"month": minMaxDate(a => a.setMonth(a.getMonth() - 1))},
  {"year": minMaxDate(a => a.setFullYear(a.getFullYear() - 1))}
])

function isLimitValid(limit) {
  return !isNaN(limit) && limit >=1 || limit <= 1000;
}

function isPeriodValid(period) {
  const validPeriod = periods.entries;
  return validPeriod.includes(period);
}

router.get("/arcade", (req, res) => {
  var limit = DEFAULTLIMIT
  var period = DEFAULTPERIOD
  if (req.params.includes("limit") && isLimitValid(req.params.limit)) {
    limit = req.params.limit;
  }
  if (req.params.includes("period") && isPeriodValid(req.params.period)) {
    period = req.params.period;
  }
  //var Score = mongoose.model('Score', scoreSchema); // da creare lo scoreSchema
  var minMax = periods(period)
  /*var result = Score.find(
    {"createdAt": //dovrebbe avere anche il capo date.. è utile?
      {
        "$gte": minMax(1),
        "$lte": minMax(0)
      }
    }).limit(limit)
    .then(scores => {res.json({data: scores})})
    .catch(err => {res.status(501).json({error: err})});// da controllare il codice di errore*/
  res.json({ data: [minMax, limit] });//non so ancora bene cosa ritorna la find
});

module.exports = router;
