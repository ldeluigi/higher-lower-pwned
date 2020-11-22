import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { addParamsToHttp } from '../helper/httpUtils';
import { UserScores } from '../model/users/scores/modeScore';
import { RequestScore } from '../model/users/scores/requestScore';
import { AccountService } from './account.service';
import { ApiURLService } from './api-url.service';

@Injectable({
  providedIn: 'root'
})
export class UserScoresService {

  constructor(
    private http: HttpClient,
    private accountService: AccountService,
    private apiURLService: ApiURLService
  ) { }

  private requestToParams(req?: RequestScore): HttpParams {
    return addParamsToHttp(new HttpParams(), [
      { name: 'limit', param: req?.limit?.toString() },
      { name: 'page', param: req?.page?.toString() },
      { name: 'sortby', param: req?.sortbyDate === undefined ? undefined : req.sortbyDate ? 'date' : undefined }
    ]);
  }

  getArcadeScores(req?: RequestScore): Observable<UserScores> {
    const url = 'arcade';
    return this.makeScoreRequest(url, this.requestToParams(req));
  }

  getDuelScores(req?: RequestScore): Observable<UserScores> {
    return this._getDuelScores(this.requestToParams(req));
  }

  getDuelWinScores(req?: RequestScore): Observable<UserScores> {
    return this._getDuelScores(this.requestToParams(req), 'win');
  }

  getDuelLostScores(req?: RequestScore): Observable<UserScores> {
    return this._getDuelScores(this.requestToParams(req), 'lose');
  }

  private _getDuelScores(httpParams: HttpParams, winOrLose?: string): Observable<UserScores> {
    const url = `duel${winOrLose ? '/' + winOrLose : ''}`;
    return this.makeScoreRequest(url, httpParams);
  }

  getRoyaleScores(req?: RequestScore): Observable<UserScores> {
    return this._getRoyaleScores(this.requestToParams(req));
  }

  getRoyaleWinScores(req?: RequestScore): Observable<UserScores> {
    return this._getRoyaleScores(this.requestToParams(req), 'win');
  }

  getRoyaleLostScores(req?: RequestScore): Observable<UserScores> {
    return this._getRoyaleScores(this.requestToParams(req), 'lose');
  }

  private _getRoyaleScores(httpParams: HttpParams, winOrLose?: string): Observable<UserScores> {
    const url = `royale${winOrLose ? '/' + winOrLose : ''}`;
    return this.makeScoreRequest(url, httpParams);
  }

  private makeScoreRequest(finalUrlPart: string, httpParams: HttpParams): Observable<UserScores> {
    if (this.accountService.userValue === null) {
      throw new Error('User not logged!');
    }
    const url = `${this.apiURLService.restApiUrl}/users/${this.accountService.userValue?.id}/scores/${finalUrlPart}`;
    return this.http.get<UserScores>(url, { params: httpParams});
  }
}
