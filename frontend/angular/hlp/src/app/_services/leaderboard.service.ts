import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { LbItem } from '../_model/lbItem';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map, first } from 'rxjs/operators';
import { Response } from '../_model/serverResponse';
import { Stats } from '../_model/stats';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {

  private leaderboardSubject: BehaviorSubject<LbItem[]>;
  private statsSubject: BehaviorSubject<Stats>;
  private leaderboardObs: Observable<LbItem[]>;
  private statsObs: Observable<Stats>;

  constructor(
    private http: HttpClient
  ) {
    this.leaderboardSubject = new BehaviorSubject<LbItem[]>([]);
    this.statsSubject = new BehaviorSubject<Stats>({} as Stats);
    this.leaderboardObs = this.leaderboardSubject.asObservable();
    this.statsObs = this.statsSubject.asObservable();
  }

  public get observableLeaderboard(): Observable<LbItem[]> {
    return this.leaderboardObs;
  }

  public get observableStats(): Observable<Stats> {
    return this.statsObs;
  }

  public refreshStats(period?: string): void {
    let param = new HttpParams();
    if (period !== undefined) {
      param = param.set('period', period);
    }
    const url = `${environment.apiUrl}/stats`;
    this.http.get<Response<Stats>>(url, { params: param })
      .subscribe(response => {
        this.statsSubject.next(response.data);
      });
  }

  public refreshLeaderboard(limit?: number, period?: string): void {
    let param = new HttpParams();
    if (limit) {
      param = param.set('limit', limit.toString());
    }
    if (period) {
      param = param.set('period', period);
    }
    const url = `${environment.apiUrl}/leaderboards/arcade`;
    console.log('leaderboard', limit, period, url); // <<------------ REMOVE
    this.http.get<Response<LbItem[]>>(url, { params: param })
      .subscribe(response => {
        this.leaderboardSubject.next(response.data);
      });
  }
}
