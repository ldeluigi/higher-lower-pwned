import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { UserStats } from '../_model/userStats';
import { UserInfo } from '../_model/userInfo';
import { environment } from 'src/environments/environment';
import { AccountService } from './account.service';
import { Response } from '../_model/serverResponse';
import { map } from 'rxjs/operators';
import { addParamsToHttp } from '../_helper/httpUtils';

@Injectable({
  providedIn: 'root'
})
export class UserDataService {

  private dataSubject: BehaviorSubject<UserStats>;
  public data: Observable<UserStats>;
  private userInfoSubject: BehaviorSubject<UserInfo>;
  public userInfo: Observable<UserInfo>;

  constructor(
    private http: HttpClient,
    private accountService: AccountService
  ) {
    this.dataSubject = new BehaviorSubject<UserStats>({} as UserStats);
    this.data = this.dataSubject.asObservable();
    this.userInfoSubject = new BehaviorSubject<UserInfo>({} as UserInfo);
    this.userInfo = this.userInfoSubject.asObservable();
  }

  loadData(period?: string, limit?: number): Observable<UserStats> {
    const user = this.accountService.userValue;
    if (user === null) {
      return of({} as UserStats);
    }
    const params: HttpParams = addParamsToHttp(new HttpParams(), [
      {name: 'period', param: period},
      {name: 'limit',  param: limit?.toString()}
    ]);
    return this.http.get<Response<UserStats>>(`${environment.apiUrl}/users/${user.id}/stats`, {params})
      .pipe(map(data => {
        this.dataSubject.next(data.data);
        return data.data;
      }));
  }

  loadUserInfo(): Observable<UserInfo> {
    const user = this.accountService.userValue;
    if (user === null) {
      return of({} as UserInfo);
    }
    return this.http.get<Response<UserInfo>>(`${environment.apiUrl}/users/${user.id}`)
      .pipe(map(response => {
        this.userInfoSubject.next(response.data);
        return response.data;
      }));
  }
}
