import { Component, OnInit } from '@angular/core';
import { Stats } from '../../_model/stats';
import { LeaderboardService } from '../../_services/leaderboard.service';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit {

  myStats = {} as Stats;

  constructor(
    private statsService: LeaderboardService,
  ) { }

  ngOnInit(): void {
    this.statsService.observableStats
      .subscribe(s => {
        console.log('Updated stats', s);
        this.myStats = s;
      });
    this.statsService.refreshStats();
  }

  getStats(p?: string): void {
    console.log(p);
    this.statsService.refreshStats(p);
  }
}
