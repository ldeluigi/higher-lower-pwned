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
};
