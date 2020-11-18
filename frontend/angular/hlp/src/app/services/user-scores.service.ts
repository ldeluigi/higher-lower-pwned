import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AccountService } from './account.service';
import { ApiURLService } from './api-url.service';
import { RequestScore } from '../model/users/scores/requestScore';
import { UserScores } from '../model/users/scores/modeScore';
import { Response } from '../model/serverResponse';
import { first, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { addParamsToHttp } from '../helper/httpUtils';

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
    return this._getDuelScores(this.requestToParams(req), 'lost');
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
    return this._getRoyaleScores(this.requestToParams(req), 'lost');
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
    console.log(httpParams);
    return this.http.get<UserScores>(url, { params: httpParams});
  }
}
