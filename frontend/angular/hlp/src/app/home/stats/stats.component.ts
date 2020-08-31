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
    stat.push({ name: 'Score', avg: stats.avgScore || 0, max: stats.maxScore || 0 });
    stat.push({ name: 'Guesses', avg: stats.avgGuesses || 0, max: stats.maxGuesses || 0 });
    stat.push({ name: 'PlaysPerDay', avg: stats.avgPlaysPerDay || 0, max: stats.maxPlaysPerDay || 0 });
    stat.push({
      name: 'Duration (seconds)',
      avg: stats.avgDuration || 0,
      max: stats.maxDuration || 0,
    });
    this.myStats = stat;
  }

  timeConversion(milliseconds: number): string {
  // Get hours from milliseconds
  const hours = milliseconds / (1000 * 60 * 60);
  const absoluteHours = Math.floor(hours);
  const h = absoluteHours > 9 ? absoluteHours : '0' + absoluteHours;

  // Get remainder from hours and convert to minutes
  const minutes = (hours - absoluteHours) * 60;
  const absoluteMinutes = Math.floor(minutes);
  const m = absoluteMinutes > 9 ? absoluteMinutes : '0' +  absoluteMinutes;

  // Get remainder from minutes and convert to seconds
  const seconds = (minutes - absoluteMinutes) * 60;
  const absoluteSeconds = Math.floor(seconds);
  const s = absoluteSeconds > 9 ? absoluteSeconds : '0' + absoluteSeconds;


  return h + ':' + m + ':' + s;
  }
}
