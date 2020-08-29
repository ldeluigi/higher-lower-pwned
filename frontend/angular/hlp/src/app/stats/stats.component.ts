import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Stats } from '../_model/stats';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit {

  private statsUrl = 'http://localhost:8080/stats';
  myStats = {} as Stats;
  periods = ['day', 'week', 'month', 'year'];
  actualPeriod = 'week';

  constructor(
    private http: HttpClient,
  ) { }

  ngOnInit(): void {
    this.getHeroes();
  }

  onSelectPeriod(period: string): void {
    this.getHeroes(period);
  }

  checkPeriod(p: string): boolean {
    return p === this.actualPeriod;
  }

  getHeroes(p: string = 'week'): void {
    this.actualPeriod = p;
    const url = `${this.statsUrl}?period=${p}`;
    this.http.get<Stats>(url)
      .subscribe(stats => this.myStats = stats);
  }
}
