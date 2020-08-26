const { query } = require("express-validator");
const genericTools = require("./generic");

function minMaxDate(handleMin) {
  const today = new Date();
  const minDay = new Date(handleMin(today));
  return [minDay, today];
}

const periods = {
  day: minMaxDate((a) => new Date(a.getTime()).setDate(a.getUTCDate() - 1)),
  week: minMaxDate((a) => new Date(a.getTime()).setDate(a.getUTCDate() - 7)),
  month: minMaxDate((a) => new Date(a.getTime()).setMonth(a.getMonth() - 1)),
  year: minMaxDate((a) =>
    new Date(a.getTime()).setFullYear(a.getFullYear() - 1)
  ),
};

function datePeriodsTimeBackNTimes(period, times) {
  if (!Object.keys(periods).includes(period)) throw new Error("Invalid Period")
  if (times <= 0) throw new Error("Invalid times")
  let currentDate = new Date()
  let p = {
    day: new Date().setDate(currentDate.getUTCDate() - 1*times),
    week: new Date().setDate(currentDate.getUTCDate() - 7*times),
    month: new Date().setMonth(currentDate.getMonth() - 1*times),
    year:  new Date().setFullYear(currentDate.getFullYear() - 1*times)
  };
  return p[period]
}

const DEFAULTPERIOD = "week";

module.exports = {
  periods: periods,

  returnPeriodFromReq: (req) => {
    return genericTools.getOrElse(req.query.period, DEFAULTPERIOD);
  },

  checkPeriod: query("period")
    .optional({ nullable: true })
    .isIn(Object.keys(periods))
    .trim(),

    datePeriodsTimeBackNTimes: datePeriodsTimeBackNTimes
};
