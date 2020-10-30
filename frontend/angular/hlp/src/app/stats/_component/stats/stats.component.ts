import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Stats } from '../../../_model/stats';
import { GameStatsService } from '../../../_services/game-stats.service';
import { timeConversion } from '../../../_helper/timeConversion';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

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
export class StatsComponent implements OnInit, OnDestroy {
  private modeSub: Subscription;
  mode = 'arcade';
  displayedColumns: string[] = ['name', 'avg', 'max'];
  myStats: Stat[] = [];

  constructor(
    private statsService: GameStatsService,
    private route: ActivatedRoute
  ) {
    this.modeSub = route.data.subscribe(elem => this.mode = elem.mode);
  }

  ngOnDestroy(): void {
    this.modeSub.unsubscribe();
  }

  ngOnInit(): void {
    this.statsService.observableStats
      .subscribe(s => this.udpateStats(s));
    this.statsService.refreshStats(undefined, this.mode);
  }

  getStats(p?: string): void {
    this.statsService.refreshStats(p, this.mode);
  }

  private udpateStats(stats: Stats): void {
    const stat: Stat[] = [];
    stat.push({ name: 'Score', avg: stats.avgScore || 0, max: stats.maxScore || 0 });
    stat.push({ name: 'Guesses', avg: stats.avgGuesses || 0, max: stats.maxGuesses || 0 });
    stat.push({ name: 'PlaysPerDay', avg: stats.avgPlaysPerDay || 0, max: stats.maxPlaysPerDay || 0 });
    stat.push({
      name: 'Duration',
      avg: stats.avgDuration || 0,
      max: stats.maxDuration || 0,
    });
    this.myStats = stat;
  }

  timeC(m: number): string {
    return timeConversion(m);
  }
}
