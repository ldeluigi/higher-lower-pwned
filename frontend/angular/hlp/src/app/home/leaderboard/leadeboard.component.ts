import { Component, OnInit } from '@angular/core';
import { StatisticService } from '../../_services/statistic.service';
import { from } from 'rxjs';
import { LbItem } from 'src/app/_model/lbItem';

@Component({
  selector: 'app-leadeboard',
  templateUrl: './leadeboard.component.html',
  styleUrls: ['./leadeboard.component.scss']
})
export class LeadeboardComponent implements OnInit {

  leaderboards: LbItem[] = [];

  constructor(
    private leaderboardService: StatisticService
  ) {
    this.leaderboardService.observableLeaderboard.subscribe(newLb => this.leaderboards = newLb);
  }

  ngOnInit(): void {
    this.updateLeaderboard();
  }

  updateLeaderboard(limit?: number, period?: string): void {
    this.leaderboardService.refreshLeaderboard(limit, period);
  }
}
