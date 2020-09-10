function convertDayNumberInDate(dayNumber: number, year: number): Date {
  return new Date(year, 0, dayNumber);
}

function timeConversion(milliseconds: number): string {
  // Get hours from milliseconds
  const hours = milliseconds / (1000 * 60 * 60);
  const absoluteHours = Math.floor(hours);
  const h = absoluteHours;

  // Get remainder from hours and convert to minutes
  const minutes = (hours - absoluteHours) * 60;
  const absoluteMinutes = Math.floor(minutes);
  const m = absoluteMinutes;

  // Get remainder from minutes and convert to seconds
  const seconds = (minutes - absoluteMinutes) * 60;
  const absoluteSeconds = Math.floor(seconds);
  const s = absoluteSeconds;

  // Get remainder from seconds and convert to milliseconds
  const milliseconds2 = (seconds - absoluteSeconds) * 1000;
  const absoluteMilliseconds = Math.floor(milliseconds2);
  const mm = absoluteMilliseconds;

  if (h > 0) {
    return h + ':' + m + ':' + s;
  } else if (m > 0) {
    return m + ':' + s + '.' + mm;
  } else {
    return s + '.' + mm;
  }
}

function daysIntoYear(date: Date): number {
  return Math.floor(
    (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(date.getFullYear(), 0, 0))
    / 24 / 60 / 60 / 1000
  );
}

function periodIterator(startPeriod: number, times: number, yearStart: number, periodType: string): { period: number, year: number }[] {
  const result: { period: number, year: number }[] = [];
  for (let index = 0; index <= times; index++) {
    let date: Date = new Date();
    let p = 0;
    if (periodType === 'day') {
      date = new Date(yearStart, 0, startPeriod + index);
      p = daysIntoYear(date);
    } else if (periodType === 'week') {
      date = new Date(yearStart, 0, (startPeriod + index) * 7);
      p = Math.floor(daysIntoYear(date) / 7);
    } else if (periodType === 'month') {
      date = new Date(yearStart, (startPeriod + index), 1);
      p = date.getMonth();
    } else if (periodType === 'year' && startPeriod === yearStart) {
      date = new Date(yearStart + index, 1, 1);
      p = date.getFullYear();
    } else {
      throw new Error('Invalid period type');
    }
    result.push({ period: p, year: date.getUTCFullYear() });
  }
  return result;
}

export {
  timeConversion,
  convertDayNumberInDate,
  periodIterator
};
