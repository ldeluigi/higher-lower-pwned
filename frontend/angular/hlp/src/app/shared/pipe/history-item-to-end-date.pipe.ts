import { Pipe, PipeTransform } from '@angular/core';
import { HistoryItem } from '../../model/userStats';
import { convertDayNumberInDate } from '../../helper/timeConversion';

@Pipe({
  name: 'historyItemToEndDate'
})
export class HistoryItemToEndDatePipe implements PipeTransform {

  transform(value: HistoryItem, period?: string): Date {
    if (!period) {
      period = 'week';
    }
    let date: Date = new Date();
    if (period === 'day') {
      date = convertDayNumberInDate(value.periodNumber, value.year);
    } else if (period === 'week') {
      const weekVariance = new Date(date.getFullYear(), 0, 1).getDay();
      date = new Date(value.year, 0, 7 * (value.periodNumber + 1) - weekVariance);
    } else if (period === 'month') {
      date = new Date(value.year, value.periodNumber, 0);
    } else if (period === 'year') {
      date = new Date(value.year + 1, 0, 0);
    } else {
      throw new Error('Invalid period');
    }

    return date;
  }

}
