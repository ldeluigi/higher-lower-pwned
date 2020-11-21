import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { LbItem } from 'src/app/model/lbItem';
import { GameStatsService } from '../../../services/game-stats.service';

@Component({
  selector: 'app-leadeboard',
  templateUrl: './leadeboard.component.html',
  styleUrls: ['./leadeboard.component.scss']
})
export class LeadeboardComponent implements OnInit, OnDestroy {

  private statsSub: Subscription | undefined;
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
    private leaderboardService: GameStatsService,
    private route: ActivatedRoute
  ) {

  }

  ngOnInit(): void {
    this.statsSub = new Subscription();
    this.statsSub.add(this.route.data.pipe(first()).subscribe(elem => this.mode = elem.mode));
    this.statsSub.add(this.leaderboardService.observableLeaderboard
      .subscribe(newLb => {
        this.dataSource.data = newLb;
      }));
    this.dataSource.paginator = this.paginator;
    this.updateLeaderboard();
  }

  ngOnDestroy(): void {
    this.statsSub?.unsubscribe();
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
