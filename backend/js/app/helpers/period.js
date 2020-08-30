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

function subtractPeriodNTimesFromToday(period, times) {
  if (!Object.keys(periods).includes(period)) throw new Error("Invalid Period")
  if (times <= 0) throw new Error("Invalid times")
  let currentDate = new Date()
  let p = {
    day: new Date(),
    week: new Date(),
    month: new Date(),
    year: new Date()
  };
  p.day.setDate(currentDate.getUTCDate() - 1 * times);
  p.week.setDate(currentDate.getUTCDate() - 7 * times);
  p.month.setMonth(currentDate.getMonth() - 1 * times);
  p.year.setFullYear(currentDate.getFullYear() - 1 * times);
  return p[period]
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
    return check
      .optional({ nullable: true })
      .trim()
      .isIn(Object.keys(periods));
  },

  subtractPeriodNTimesFromToday: subtractPeriodNTimesFromToday
};