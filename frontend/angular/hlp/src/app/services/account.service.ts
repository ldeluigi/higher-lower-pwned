import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { LogLevel } from '../model/logLevel';
import { Response } from '../model/serverResponse';
import { TokenRefresh } from '../model/tokenRefresh';
import { User } from '../model/user';
import { UserRegistration, UserRegistrationResponse } from '../model/UserRegistration';
import { ApiURLService } from './api-url.service';
import { LogService } from './log.service';

@Injectable({
  providedIn: 'root'
})
export class AccountService implements OnDestroy {

  private userSubject: BehaviorSubject<User | null>;
  private userLocalStorage = 'user';
  public user: Observable<User | null>;

  constructor(
    private router: Router,
    private http: HttpClient,
    private logService: LogService,
    private apiURL: ApiURLService
  ) {
    this.userSubject = new BehaviorSubject<User | null>(this.extractUser());
    this.user = this.userSubject.asObservable();
  }
  ngOnDestroy(): void {
    if (this.userValue !== null) {
      this.logout();
    }
  }

  public get userValue(): User | null {
    return this.userSubject.value;
  }

  private extractUser(): User | null {
    const u = localStorage.getItem(this.userLocalStorage);
    if (u !== null) {
      return JSON.parse(u);
    }
    return null;
  }

  login(username: string, password: string): Observable<User | null> {
    // console.log({ username, password });
    return this.http.post<Response<User | null>>(`${this.apiURL.restApiUrl}/users/login`, { username, password })
      .pipe(map(u => {
        localStorage.setItem(this.userLocalStorage, JSON.stringify(u.data));
        this.userSubject.next(u.data);
        this.logService.messageSnackBar('Logged in properly');
        return u.data;
      }));
  }

  logout(message?: string): void {
    // remove user from local storage and set current user to null
    localStorage.removeItem(this.userLocalStorage);
    this.userSubject.next(null);
    if (message) { // User is logout for some unkown reason
      this.logService.infoSnackBar(message);
    } else { // User ask for logout
      this.logService.messageSnackBar('Logged out properly');
    }
    this.router.navigate(['/']);
  }

  register(user: UserRegistration): Observable<UserRegistrationResponse> {
    return this.http.post<Response<UserRegistrationResponse>>(`${this.apiURL.restApiUrl}/users`, user)
      .pipe(map(u => u.data));
  }

  async updateEmail(newEmail: string): Promise<void> {
    const data = { email: newEmail };
    await this.update(data);
    return;
  }

  async updatePassword(oldPassword: string, newPassword: string): Promise<void> {
    const data = { oldPassword, password: newPassword };
    await this.update(data);
    return;
  }

  // tslint:disable-next-line: no-any
  private async update(data: any): Promise<void> {
    const user = this.extractUser();
    if (user === null) {
      this.logService.log('No user logged while try to update user info', LogLevel.Error);
      throw Error('Invalid user');
    }
    this.http.put(`${this.apiURL.restApiUrl}/users/${user.id}`, data)
      .pipe(map(_ => {
        this.logService.messageSnackBar('Data updated correctly');
        return;
      })).pipe(first()).subscribe();
  }

  refreshToken(): Observable<TokenRefresh> {
    const user: User | null = this.userValue;
    if (user === null) {
      this.logService.log('No user logged while try to refresh token', LogLevel.Error);
      return throwError('No user logged');
    }
    return this.http.post<Response<TokenRefresh>>(`${this.apiURL.restApiUrl}/users/refresh`, { token: user.token, refresh: user.refresh })
      .pipe(map(a => {
        user.token = a.data.token;
        user.refresh = a.data.refresh;
        this.userSubject.next(user);
        return a.data;
      }));
  }

  deleteUser(): Observable<User> {
    const user: User | null = this.userValue;
    if (user === null) {
      this.logService.log('No user logged while try to delete user', LogLevel.Error);
      return throwError('No user logged');
    }
    return this.http.delete<Response<User>>(`${this.apiURL.restApiUrl}/users/${user.id}`)
      .pipe(map(a => {
        localStorage.removeItem(this.userLocalStorage);
        this.userSubject.next(null);
        return a.data;
      }));
  }
}
