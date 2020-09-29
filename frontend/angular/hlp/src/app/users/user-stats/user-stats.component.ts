import { Component, OnInit, ViewChild } from '@angular/core';
import { UserDataService } from '../../_services/user-data.service';
import { HistoryItem } from '../../_model/userStats';
import { MatTableDataSource } from '@angular/material/table';
import { ChartType, ChartOptions } from 'chart.js';
import { MatPaginator } from '@angular/material/paginator';
import { timeConversion, periodIterator } from '../../_helper/timeConversion';
import { FormControl, Validators } from '@angular/forms';
import { HistoryItemToEndDatePipe } from 'src/app/_helper/history-item-to-end-date.pipe';
import { HistoryItemToStartDatePipe } from 'src/app/_helper/history-item-to-start-date.pipe';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-user-stats',
  templateUrl: './user-stats.component.html',
  styleUrls: ['./user-stats.component.scss'],
})
export class UserStatsComponent implements OnInit {
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

  limit = new FormControl('10', [
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

  constructor(
    private usersTools: UserDataService,
    private startDatePipe: HistoryItemToStartDatePipe,
    private endDatePipe: HistoryItemToEndDatePipe,
    private datePipe: DatePipe
  ) {
    usersTools.data.subscribe((data) => {
      const array = data?.history || [];
      console.log('array', array);
      this.dataSource.data = array;
      let scores: HistoryItem[] = [];
      let label: Array<string> = [];
      if (array.length > 0) {
        const end = this.periodBegin();
        const periods = periodIterator(
          end.period,
          this.actualLimitValue,
          end.year,
          this.actualPeriod
        );
        let lastElement: HistoryItem = { maxScore: 0 } as HistoryItem;
        periods.forEach((e) => {
          const periodN = e.period;
          const findResult = array.find(
            (e2) => e2.periodNumber === periodN && e2.year === e.year
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
          console.log(lastElement, element);
          if (lastElement.maxScore === 0 && element.maxScore === 0) {
            const lastLabel = label.pop();
            if (lastLabel) {
              label.push('...');
            }
          } else {
            scores.push(element);

            const startDate = startDatePipe.transform(
              element,
              this.actualPeriod
            );
            if (this.actualPeriod === 'day') {
              label.push(datePipe.transform(startDate, 'dd/MM/yy') as string);
            } else {
              const format =
                this.actualPeriod === 'week'
                  ? 'dd/MM/yy'
                  : this.actualPeriod === 'month'
                  ? 'MM/yy'
                  : 'yyyy';
              if (this.actualPeriod === 'week') {
                label.push(
                  ((datePipe.transform(startDate, format) as string) +
                    ' - ' +
                    datePipe.transform(
                      endDatePipe.transform(element, this.actualPeriod),
                      format
                    )) as string
                );
              } else {
                label.push(datePipe.transform(startDate, format) as string);
              }
            }
          }
          // save lastElement
          lastElement = element;
        });
      }
      console.log('scores:', scores, 'label:', label);
      let lastIndex = 0;
      for (let i = 0; i < scores.length; i++) {
        if (scores[i].maxScore > 0) {
          lastIndex = i;
          break;
        }
      }
      if (lastIndex > 0) {
        scores = scores.splice(lastIndex);
        label = label.splice(lastIndex - 1);
      }
      console.log('scores:', scores, 'label:', label);
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

  private daysIntoYear(date: Date): number {
    return (
      (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) -
        Date.UTC(date.getFullYear(), 0, 1)) /
      24 /
      60 /
      60 /
      1000
    );
  }

  private periodBegin(): { period: number; year: number } {
    const now = new Date();
    const currentYear = now.getFullYear();
    if (this.actualPeriod === 'day') {
      const old = new Date(
        now.getFullYear(),
        0,
        this.daysIntoYear(now) - this.actualLimitValue + 1
      );
      return { period: this.daysIntoYear(old), year: old.getFullYear() };
    } else if (this.actualPeriod === 'week') {
      const old = new Date(
        now.getFullYear(),
        0,
        this.daysIntoYear(now) + -this.actualLimitValue * 7
      );
      return {
        period: Math.floor(this.daysIntoYear(old) / 7),
        year: old.getFullYear(),
      };
    } else if (this.actualPeriod === 'month') {
      const old = new Date(
        now.getFullYear(),
        now.getMonth() - this.actualLimitValue + 1,
        1
      );
      return { period: old.getMonth(), year: old.getFullYear() };
    } else if (this.actualPeriod === 'year') {
      const old = new Date(now.getFullYear() - this.actualLimitValue, 1, 1);
      return { period: old.getFullYear(), year: old.getFullYear() };
    }
    throw new Error('Illegal period');
  }

  ngOnInit(): void {
    this.dataSource.paginator = this.paginator;
    this.updateUserStats();
  }

  updateUserStats(period?: string): void {
    if (period) {
      this.actualPeriod = period;
    }
    if (this.limit.invalid) {
      this.limit.setValue(10);
    }
    this.actualLimitValue = this.limit.value;
    this.updateStatsLayout();
    this.usersTools.loadData(this.actualPeriod, this.limit.value).subscribe();
  }

  timeC(millisecond: number): string {
    return timeConversion(millisecond);
  }
}
