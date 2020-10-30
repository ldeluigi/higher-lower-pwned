import { Injectable, OnDestroy } from '@angular/core';
import { User } from '../_model/user';
import { UserRegistration, UserRegistrationResponse } from '../_model/UserRegistration';
import { TokenRefresh } from '../_model/tokenRefresh';
import { Route, Router } from '@angular/router';
import { HttpClient, JsonpInterceptor } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Response } from '../_model/serverResponse';
import { MatSnackBar } from '@angular/material/snack-bar';
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

  update(password?: string, email?: string): Observable<boolean> {
    if (password === undefined && email === undefined) {
      return of(false);
    }
    const params: { password?: string; email?: string; } = {
      password,
      email
    };
    const user = this.extractUser();
    if (user === null) {
      this.log('Can\'t update your data');
      return of(false);
    } else {
      return this.http.put(`${this.apiURL.restApiUrl}/users/${user.id}`, params)
        .pipe(map(x => {
          this.log('Data update correctly');
          return true;
        }));
    }
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
        // console.log(user.token, a.data.token);
        this.userSubject.next(user);
        return a.data;
      }));
  }
}
