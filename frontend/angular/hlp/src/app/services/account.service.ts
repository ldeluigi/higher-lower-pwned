import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { Response } from '../model/serverResponse';
import { TokenRefresh } from '../model/tokenRefresh';
import { User } from '../model/user';
import { UserRegistration, UserRegistrationResponse } from '../model/UserRegistration';
import { ApiURLService } from './api-url.service';

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
    private snackBar: MatSnackBar,
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

  private log(message: string): void {
    this.snackBar.open(message, 'ok', { duration: 3000 });
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
        this.log('Logged in properly');
        return u.data;
      }));
  }

  logout(message?: string): void {
    // remove user from local storage and set current user to null
    localStorage.removeItem(this.userLocalStorage);
    this.userSubject.next(null);
    // TODO navigate function in the router
    this.log(message || 'Logged out properly');
    this.router.navigate(['/']);
  }

  register(user: UserRegistration): Observable<UserRegistrationResponse> {
    return this.http.post<Response<UserRegistrationResponse>>(`${this.apiURL.restApiUrl}/users`, user)
      .pipe(map(u => u.data));
  }

  async updateEmail(newEmail: string): Promise<void> {
    const data = {email: newEmail};
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
      throw Error('Invalid user');
    }
    this.http.put(`${this.apiURL.restApiUrl}/users/${user.id}`, data)
      .pipe(map(_ => {
        this.log('Data update correctly');
        return;
      })).pipe(first()).subscribe();
  }

  refreshToken(): Observable<TokenRefresh> {
    const user: User | null = this.userValue;
    if (user === null) {
      return throwError('No user logged');
    }
    // console.log(`${environment.apiUrl}/users/refresh`, user);
    return this.http.post<Response<TokenRefresh>>(`${this.apiURL.restApiUrl}/users/refresh`, { token: user.token, refresh: user.refresh })
      .pipe(map(a => {
        user.token = a.data.token;
        user.refresh = a.data.refresh;
        this.userSubject.next(user);
        return a.data;
      }));
  }

  /**
   * // TODO implement
   */
  deleteUser(): Observable<User> {
    const user: User | null = this.userValue;
    if (user === null) {
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
