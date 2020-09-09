import { Pipe, PipeTransform } from '@angular/core';
import { HistoryItem } from '../_model/userStats';
import { convertDayNumberInDate } from './timeConversion';

@Pipe({
  name: 'historyItemToStartDate'
})
export class HistoryItemToStartDatePipe implements PipeTransform {

  transform(value: HistoryItem, period?: string): Date {
    if (!period) {
      period = 'week';
    }
    let date: Date = new Date();
    if (period === 'day') {
      date = convertDayNumberInDate(value.periodNumber, value.year);
    } else if (period === 'week') {
      date = new Date(value.year, 0, 7 * (value.periodNumber) + 1);
    } else if (period === 'month') {
      date = new Date(value.year, value.periodNumber, 1);
    } else if (period === 'year') {
      date = new Date(value.year, 0, 1);
    } else {
      throw new Error('Invalid period');
    }

    return date;
  }

}
