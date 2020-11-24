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

  period: string | undefined;
  displayedColumns = ['position', 'username', 'score', 'date'];
  dataSource = new MatTableDataSource<LbItem>([]);

  @ViewChild(MatPaginator, {static: true}) paginator!: MatPaginator;
  selected = 10;

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

  updateLeaderboard(period?: string): void {
    if (period !== undefined) {
      this.period = period;
    }
    this.leaderboardService.refreshLeaderboard(this.selected, this.period, this.mode);
  }

  updateLimit(limit: number): void {
    this.selected = limit;
    this.updateLeaderboard(this.period);
  }
}
