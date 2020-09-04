import { Component, OnInit, ViewChild } from '@angular/core';
import { UserDataService } from '../../_services/user-data.service';
import { HistoryItem } from '../../_model/userStats';
import { MatTableDataSource } from '@angular/material/table';
import { ChartType, ChartOptions } from 'chart.js';
import { MatPaginator } from '@angular/material/paginator';
import { timeConversion } from '../../_helper/timeConversion';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-user-stats',
  templateUrl: './user-stats.component.html',
  styleUrls: ['./user-stats.component.scss'],
})
export class UserStatsComponent implements OnInit {
  lineChartType: ChartType = 'line';
  lineChartData: Array<object> = [
    { data: [65, 59, 80, 81, 56, 55, 40], label: 'My First dataset' },
  ];

  lineChartOptions: ChartOptions & { annotation: object } = {
    responsive: true,
    scales: {
      // We use this empty structure as a placeholder for dynamic theming.
      xAxes: [{}],
      yAxes: [
        {
          id: 'y-axis-0',
          position: 'left',
          ticks: {
            beginAtZero: true,
          },
        },
      ],
    },
    annotation: {
      annotations: [
        {
          type: 'line',
          mode: 'vertical',
          scaleID: 'x-axis-0',
          value: 'March',
          borderColor: 'orange',
          borderWidth: 2,
          label: {
            enabled: true,
            fontColor: 'orange',
            content: 'LineAnno',
          },
        },
      ],
    },
  };

  lineChartColors: Array<object> = [
    {
      backgroundColor: 'rgba(105, 0, 132, .2)',
      borderColor: 'rgba(200, 99, 132, .7)',
      borderWidth: 2,
    },
  ];

  limit = new FormControl('', [
    Validators.required,
    Validators.pattern('^[0-9]*$'),
    Validators.max(1000),
  ]);

  dataSource = new MatTableDataSource<HistoryItem>([]);
  displayedColumns = [
    'avgScore',
    'avgGuesses',
    'avgPlaysPerDay',
    'avgDuration',
    'maxScore',
    'maxGuesses',
    'maxDuration',
  ];

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  period: string | undefined;

  constructor(private usersTools: UserDataService) {
    usersTools.data.subscribe((data) => {
      const array = data?.history || [];
      this.dataSource.data = array;
      this.lineChartData = [
        {
          data: array.map((hist) => hist.avgScore),
          label: 'Avg Score',
        },
        {
          data: array.map((hist) => hist.maxScore),
          label: 'Max Score',
        },
      ];
    });
  }

  ngOnInit(): void {
    this.dataSource.paginator = this.paginator;
    this.updateUserStats();
  }

  updateUserStats(period?: string): void {
    if (period !== undefined) {
      this.period = period;
    }
    if (this.limit.invalid) {
      this.usersTools.loadData(this.period, undefined).subscribe();
      return;
    }
    this.usersTools.loadData(this.period, this.limit.value).subscribe();
  }

  timeC(millisecond: number): string {
    return timeConversion(millisecond);
  }
}
