import { Pipe, PipeTransform } from '@angular/core';
import { DEFAULT_PERIOD } from './date-format.constant';
import { HistoryItem } from '../../model/userStats';
import { convertDayNumberInDate } from '../../helper/timeConversion';

@Pipe({
  name: 'historyItemToStartDate'
})
export class HistoryItemToStartDatePipe implements PipeTransform {

  transform(value: HistoryItem, period?: string): Date {
    period = period ? period : DEFAULT_PERIOD;
    let date: Date = new Date();
    switch (period) {
      case 'day':
        date = convertDayNumberInDate(value.periodNumber, value.year);
        break;
      case 'week':
        const weekVariance = new Date(date.getFullYear(), 0, 1).getDay();
        date = new Date(value.year, 0, 7 * (value.periodNumber) - weekVariance + 1);
        break;
      case 'month':
        date = new Date(value.year, value.periodNumber - 1, 1);
        break;
      case 'year':
        date = new Date(value.year, 0, 1);
        break;
      default:
        throw new Error('Invalid period');
    }
    return date;
  }

}
