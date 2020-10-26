import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { StatisticService } from '../../../_services/statistic.service';
import { from, Subscription } from 'rxjs';
import { LbItem } from 'src/app/_model/lbItem';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-leadeboard',
  templateUrl: './leadeboard.component.html',
  styleUrls: ['./leadeboard.component.scss']
})
export class LeadeboardComponent implements OnInit, OnDestroy {

  private modeSub: Subscription;
  private leadSub: Subscription;
  mode = 'arcade';

  limit = new FormControl('', [
    Validators.required,
    Validators.pattern('^[0-9]*$'),
    Validators.max(1000)
  ]);
  period: string | undefined;
  displayedColumns = ['position', 'username', 'score', 'date'];
  dataSource = new MatTableDataSource<LbItem>([]);

  @ViewChild(MatPaginator, {static: true}) paginator!: MatPaginator;

  constructor(
    private leaderboardService: StatisticService,
    private route: ActivatedRoute
  ) {
    this.modeSub = route.data.subscribe(elem => this.mode = elem.mode);
    this.leadSub = this.leaderboardService.observableLeaderboard
      .subscribe(newLb => {
        this.dataSource.data = newLb;
      });
  }

  ngOnInit(): void {
    this.dataSource.paginator = this.paginator;
    this.updateLeaderboard();
  }

  ngOnDestroy(): void {
    this.modeSub.unsubscribe();
    this.leadSub.unsubscribe();
  }

  updateLeaderboard(limit?: number, period?: string): void {
    if (period !== undefined) {
      this.period = period;
    }
    if (this.limit.invalid) {
      this.leaderboardService.refreshLeaderboard(undefined, this.period, this.mode);
      return;
    }
    this.leaderboardService.refreshLeaderboard(this.limit.value, this.period, this.mode);
  }
}
