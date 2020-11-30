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

const periods = {
  day: minMaxDate((a) =>
    subtractPeriodNTimesFromDate(a, defaultPeriods.day, 1)
  ),
  week: minMaxDate((a) =>
    subtractPeriodNTimesFromDate(a, defaultPeriods.week, 1)
  ),
  month: minMaxDate((a) =>
    subtractPeriodNTimesFromDate(a, defaultPeriods.month, 1)
  ),
  year: minMaxDate((a) =>
    subtractPeriodNTimesFromDate(a, defaultPeriods.year, 1)
  ),
  forever: minMaxDate((a) =>
    subtractPeriodNTimesFromDate(a, defaultPeriods.forever, 1)
  ),
};

function subtractPeriodNTimesFromDate(date, period, times) {
  if (!Object.keys(defaultPeriods).includes(period))
    throw new Error("Invalid Period");
  if (times <= 0) throw new Error("Invalid times");
  times--;
  //console.log(currentDate.getDay());
  let p = {
    day: new Date(date.getFullYear(), date.getMonth(), date.getDate() - times),
    week: new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() - date.getDay() - 7 * times
    ),
    month: new Date(date.getFullYear(), date.getMonth() - times),
    year: new Date(date.getFullYear() - times, 0),
    forever: new Date(0),
  };
  return p[period];
}

function subtractPeriodNTimesFromToday(period, times) {
  return subtractPeriodNTimesFromDate(new Date(), period, times);
}

function periodInDays(period) {
  const periodMinMax = periods[period];
  const periodInMilliseconds = periodMinMax[1] - periodMinMax[0];
  return periodInMilliseconds / (24 * 60 * 60 * 1000);
}

module.exports = {
  periods: periods,
  periodsInDays: periodInDays,
  default: "week",

  checkPeriod: function (check) {
    return check.optional({ nullable: true }).trim().isIn(Object.keys(periods));
  },

  subtractPeriodNTimesFromToday: subtractPeriodNTimesFromToday,
};
