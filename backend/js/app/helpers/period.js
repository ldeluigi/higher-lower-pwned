function minMaxDate(handleMin) {
  const today = new Date();
  // we want take the current day
  today.setHours(23, 59, 59, 999);
  const minDay = new Date(handleMin(today));
  return [minDay, today];
}

const defaultPeriods = {
  day: "day",
  week: "week",
  month: "month",
  year: "year",
  forever: "forever",
};

const periods = (p) => minMaxDate((a) => subtractPeriodNTimesFromDate(a, p, 1));

function subtractPeriodNTimesFromDate(date, period, times) {
  if (!Object.keys(defaultPeriods).includes(period))
    throw new Error("Invalid Period");
  if (times <= 0) throw new Error("Invalid times");
  times--;
  //console.log(currentDate.getDay());
  let p = {
    day: new Date(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate() - times
    ),
    week: new Date(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate() - date.getUTCDay() - 7 * times
    ),
    month: new Date(date.getUTCFullYear(), date.getUTCMonth() - times),
    year: new Date(date.getUTCFullYear() - times, 0),
    forever: new Date(0),
  };
  return p[period];
}

function subtractPeriodNTimesFromToday(period, times) {
  return subtractPeriodNTimesFromDate(new Date(), period, times);
}

function periodInDays(period) {
  const periodMinMax = periods(period);
  const periodInMilliseconds = periodMinMax[1] - periodMinMax[0];
  return periodInMilliseconds / (24 * 60 * 60 * 1000);
}

module.exports = {
  periods: periods,
  periodsInDays: periodInDays,
  default: "week",

  checkPeriod: function (check) {
    return check
      .optional({ nullable: true })
      .trim()
      .isIn(Object.keys(defaultPeriods));
  },

  subtractPeriodNTimesFromToday: subtractPeriodNTimesFromToday,
};
