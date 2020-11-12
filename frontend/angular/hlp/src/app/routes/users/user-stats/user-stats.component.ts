import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UserDataService } from '../../../services/user-data.service';
import { HistoryItem } from '../../../model/userStats';
import { MatTableDataSource } from '@angular/material/table';
import { ChartType, ChartOptions } from 'chart.js';
import { MatPaginator } from '@angular/material/paginator';
import {
  timeConversion,
  periodIterator,
  daysOfTheYear,
} from '../../../helper/timeConversion';
import { FormControl, Validators } from '@angular/forms';
import { HistoryItemToEndDatePipe } from 'src/app/shared/pipe/history-item-to-end-date.pipe';
import { HistoryItemToStartDatePipe } from 'src/app/shared/pipe/history-item-to-start-date.pipe';
import { DatePipe } from '@angular/common';
import * as Const from '../../../shared/pipe/date-format.constant';
import { first } from 'rxjs/operators';
import { Subscription } from 'rxjs';

export const GRAPH_EMPTY_PERIODS = '...';

@Component({
  selector: 'app-user-stats',
  templateUrl: './user-stats.component.html',
  styleUrls: ['./user-stats.component.scss'],
})
export class UserStatsComponent implements OnInit, OnDestroy {
  expanded = true;

  lineChartType: ChartType = 'bar';
  lineChartData: Array<object> = [];

  chartLabels: Array<string> = [];

  lineChartOptions: ChartOptions = {
    responsive: true,
    scales: {
      // We use this empty structure as a placeholder for dynamic theming.
      xAxes: [
        {
          stacked: true,
        },
      ],
      yAxes: [
        {
          stacked: false,
          ticks: {
            beginAtZero: true,
          },
        },
      ],
    },
  };

  lineChartColors: Array<object> = [
    {
      // avg
      backgroundColor: 'rgba(200, 0, 0, .3)',
      borderColor: 'rgba(200, 0, 0, .5)',
      borderWidth: 2,
    },
    {
      // max
      backgroundColor: 'rgba(51, 51, 255, .6)',
      borderColor: 'rgba(51, 51, 255, .8)',
      borderWidth: 2,
    },
  ];

  limit = new FormControl('', [
    Validators.required,
    Validators.pattern('^[0-9]*$'),
    Validators.max(30),
    Validators.min(1),
  ]);

  private actualLimitValue = 10;

  dataSource = new MatTableDataSource<HistoryItem>([]);
  private defaultColumns = [
    'avgScore',
    'avgGuesses',
    'avgPlaysPerDay',
    'avgDuration',
    'maxScore',
    'maxGuesses',
    'maxDuration',
  ];
  displayedColumns = this.defaultColumns;

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  actualPeriod = 'week';
  private sub: Subscription | undefined;

  constructor(
    private usersTools: UserDataService,
    private startDatePipe: HistoryItemToStartDatePipe,
    private endDatePipe: HistoryItemToEndDatePipe,
    private datePipe: DatePipe
  ) {
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private prependToDefaultColumns(columns: string[]): string[] {
    return columns.concat(this.defaultColumns);
  }

  private updateStatsLayout(): void {
    if (this.actualPeriod) {
      if (this.actualPeriod === 'week') {
        this.displayedColumns = this.prependToDefaultColumns([
          'startDate',
          'endDate',
        ]);
      } else {
        this.displayedColumns = this.prependToDefaultColumns([
          this.actualPeriod,
        ]);
      }
    }
  }

  private periodBegin(): { period: number; year: number } {
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    const currentYear = now.getFullYear();
    switch (this.actualPeriod) {
      case 'day':
        const old1 = new Date(
          currentYear,
          0,
          daysOfTheYear(now) - this.actualLimitValue + 1
        );
        return { period: daysOfTheYear(old1), year: old1.getFullYear() };
      case 'week':
        const weekVariance = new Date(currentYear, 0, 1).getDay();
        const old2 = new Date(
          currentYear,
          0,
          daysOfTheYear(now) + -this.actualLimitValue * 7
        );
        return {
          period: Math.floor((daysOfTheYear(old2) - weekVariance + 7) / 7),
          year: old2.getFullYear(),
        };
      case 'month':
        const old3 = new Date(
          currentYear,
          now.getMonth() - this.actualLimitValue + 1,
          1
        );
        return { period: old3.getMonth(), year: old3.getFullYear() };
      case 'year':
        const old4 = new Date(currentYear - this.actualLimitValue, 1, 1);
        return { period: old4.getFullYear(), year: old4.getFullYear() };
      default:
        throw new Error('Illegal period');
    }
  }

  ngOnInit(): void {
    this.sub = this.usersTools.data.subscribe((data) => {
      const array = data?.history || [];
      // console.log('array', array);
      this.dataSource.data = array;
      const scores: HistoryItem[] = [];
      const label: Array<string> = [];
      if (array.length > 0) {
        const end = this.periodBegin();
        const periods = periodIterator(
          end.period,
          this.actualLimitValue,
          end.year,
          this.actualPeriod
        );
        let lastElement: HistoryItem = { avgPlaysPerDay: 0 } as HistoryItem;
        periods.forEach((e) => {
          // console.log(e);
          const periodN = e.period;
          const findResult = array.find(
            (item) => item.periodNumber === periodN && item.year === e.year
          );
          const element = findResult
            ? findResult
            : {
                periodNumber: periodN,
                year: e.year,
                avgScore: 0,
                avgGuesses: 0,
                avgPlaysPerDay: 0,
                avgDuration: 0,
                maxScore: 0,
                maxGuesses: 0,
                maxDuration: 0,
              };
          // console.log("out", lastElement, element);
          if (
            lastElement.avgPlaysPerDay !== 0 &&
            element.avgPlaysPerDay === 0
          ) {
            if (periods[periods.length - 1] !== e) {
              label.push(GRAPH_EMPTY_PERIODS);
              scores.push(element);
            } else {
              scores.pop();
            }
            // ignoring other void periods
          } else if (
            !(lastElement.avgPlaysPerDay === 0 && element.avgPlaysPerDay === 0)
          ) {
            scores.push(element);

            // console.log(element);
            const startDate = this.startDatePipe.transform(
              element,
              this.actualPeriod
            );
            switch (this.actualPeriod) {
              case 'day':
                label.push(
                  this.datePipe.transform(startDate, Const.FORMAT_DAY) as string
                );
                break;
              case 'week':
                label.push(
                  ((this.datePipe.transform(
                    startDate,
                    Const.FORMAT_WEEK
                  ) as string) +
                    ' - ' +
                    this.datePipe.transform(
                      this.endDatePipe.transform(element, this.actualPeriod),
                      Const.FORMAT_WEEK
                    )) as string
                );
                break;
              case 'month':
                label.push(
                  this.datePipe.transform(startDate, Const.FORMAT_MONTH) as string
                );
                break;
              case 'year':
                label.push(
                  this.datePipe.transform(startDate, Const.FORMAT_YEAR) as string
                );
                break;
            }
          }
          // save lastElement
          lastElement = element;
        });
      }
      // console.log('scores:', scores, 'label:', label);
      let lastIndex = scores.length;
      for (let i = scores.length - 1; i > 0; i--) {
        if (scores[i].avgPlaysPerDay > 0) {
          break;
        }
        lastIndex = i;
      }
      if (lastIndex < scores.length) {
        scores.splice(lastIndex);
        label.splice(lastIndex);
      }
      this.expanded = scores.length !== 0;

      this.chartLabels = label;
      this.lineChartData = [
        {
          data: scores.map((hist) => Math.floor(hist.avgScore)),
          label: 'Avg Score',
          categoryPercentage: 1,
          barPercentage: 0.6,
          type: 'line',
        },
        {
          data: scores.map((hist) => hist.maxScore),
          label: 'Max Score',
          categoryPercentage: 1,
          barPercentage: 0.2,
        },
      ];
    });

    this.dataSource.paginator = this.paginator;
    this.updateUserStats();
  }

  updateUserStats(period?: string): void {
    if (period) {
      this.actualPeriod = period;
    }
    this.updateStatsLayout();
    if (this.limit.invalid) {
      this.usersTools.loadData(this.actualPeriod, undefined).pipe(first()).subscribe();
    } else {
      this.usersTools.loadData(this.actualPeriod, this.limit.value).pipe(first()).subscribe();
    }
  }

  timeC(millisecond: number): string {
    return timeConversion(millisecond);
  }
}
