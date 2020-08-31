import { Component, OnInit } from '@angular/core';
import { Stats } from '../../_model/stats';
import { StatisticService } from '../../_services/statistic.service';

export interface Stat {
  name: string;
  avg: number;
  max: number;
}

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit {

  displayedColumns: string[] = ['name', 'avg', 'max'];
  myStats: Stat[] = [];

  constructor(
    private statsService: StatisticService,
  ) { }

  ngOnInit(): void {
    this.statsService.observableStats
      .subscribe(s => this.udpateStats(s));
    this.statsService.refreshStats();
  }

  getStats(p?: string): void {
    this.statsService.refreshStats(p);
  }

  private udpateStats(stats: Stats): void {
    const stat: Stat[] = [];
    stat.push({name: 'Score', avg: stats.avgScore || 0, max: stats.maxScore || 0});
    stat.push({name: 'Guesses', avg: stats.avgGuesses || 0, max: stats.maxGuesses || 0});
    stat.push({name: 'PlaysPerDay', avg: stats.avgPlaysPerDay || 0, max: stats.maxPlaysPerDay || 0});
    stat.push({
      name: 'Duration (seconds)',
      avg: stats.avgDuration || 0 / 1000,
      max: stats.maxDuration || 0 / 1000,
    });
    this.myStats = stat;
  }
}
