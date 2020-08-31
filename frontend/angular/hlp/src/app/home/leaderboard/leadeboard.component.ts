import { Component, OnInit, ViewChild } from '@angular/core';
import { StatisticService } from '../../_services/statistic.service';
import { from } from 'rxjs';
import { LbItem } from 'src/app/_model/lbItem';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-leadeboard',
  templateUrl: './leadeboard.component.html',
  styleUrls: ['./leadeboard.component.scss']
})
export class LeadeboardComponent implements OnInit {

  limit = new FormControl('', [
    Validators.required,
    Validators.pattern('^[0-9]*$'),
    Validators.max(1000)
  ]);
  period: string | undefined;
  displayedColumns = ['username', 'score', 'date'];
  dataSource = new MatTableDataSource<LbItem>([]);

  @ViewChild(MatPaginator, {static: true}) paginator!: MatPaginator;

  constructor(
    private leaderboardService: StatisticService
  ) {
    this.leaderboardService.observableLeaderboard
      .subscribe(newLb => {
        this.dataSource.data = newLb;
      });
  }

  ngOnInit(): void {
    this.dataSource.paginator = this.paginator;
    this.updateLeaderboard();
  }

  updateLeaderboard(limit?: number, period?: string): void {
    if (period !== undefined) {
      this.period = period;
    }
    if (this.limit.invalid) {
      this.leaderboardService.refreshLeaderboard(undefined, this.period);
      return;
    }
    this.leaderboardService.refreshLeaderboard(this.limit.value, this.period);
  }
}
