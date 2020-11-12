import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { LbItem } from '../model/lbItem';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Response } from '../model/serverResponse';
import { Stats } from '../model/stats';
import { addParamsToHttp } from '../helper/httpUtils';
import { ApiURLService } from './api-url.service';
import { first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GameStatsService {

  private leaderboardSubject: BehaviorSubject<LbItem[]>;
  private statsSubject: BehaviorSubject<Stats>;
  private leaderboardObs: Observable<LbItem[]>;
  private statsObs: Observable<Stats>;

  constructor(
    private http: HttpClient,
    private apiURL: ApiURLService
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

  public refreshStats(period?: string, mode: string = ''): void {
    const param = addParamsToHttp(new HttpParams(), [{ name: 'period', param: period }]);
    const urlMode = mode.length > 0 ? `/${mode}` : '';
    const url = `${this.apiURL.restApiUrl}/stats${urlMode}`;
    this.http.get<Response<Stats>>(url, { params: param })
      .pipe(first())
      .subscribe(response => {
        this.statsSubject.next(response.data);
      });
  }

  public refreshLeaderboard(limit?: number, period?: string, mode: string = 'arcade'): void {
    const params = addParamsToHttp(new HttpParams(), [
      { name: 'limit', param: limit?.toString() },
      { name: 'period', param: period }
    ]);
    const url = `${this.apiURL.restApiUrl}/leaderboards/${mode}`;
    this.http.get<Response<LbItem[]>>(url, { params })
      .pipe(first())
      .subscribe(response => {
        this.leaderboardSubject.next(response.data);
      });
  }
}
