import { Component, OnInit } from '@angular/core';
import { Stats } from '../../_model/stats';
import { StatisticService } from '../../_services/statistic.service';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit {

  myStats = {} as Stats;

  constructor(
    private statsService: StatisticService,
  ) { }

  ngOnInit(): void {
    this.statsService.observableStats
      .subscribe(s => {
        this.myStats = s;
      });
    this.statsService.refreshStats();
  }

  getStats(p?: string): void {
    this.statsService.refreshStats(p);
  }
}
