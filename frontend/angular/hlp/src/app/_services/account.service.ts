import { Injectable } from '@angular/core';
import { User } from '../_model/user';
import { UserRegistration, UserRegistrationResponse } from '../_model/UserRegistration';
import { TokenRefresh } from '../_model/tokenRefresh';
import { Route, Router } from '@angular/router';
import { HttpClient, JsonpInterceptor } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Response } from '../_model/serverResponse';
@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private userSubject: BehaviorSubject<User | null>;
  private userLocalStorage = 'user';
  public user: Observable<User | null>;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    this.userSubject = new BehaviorSubject<User | null>(this.extractUser());
    this.user = this.userSubject.asObservable();
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
    return this.http.post<Response<User | null>>(`${environment.apiUrl}/users/login`, { username, password })
      .pipe(map(u => {
        localStorage.setItem(this.userLocalStorage, JSON.stringify(u.data));
        this.userSubject.next(u.data);
        return u.data;
      }));
  }

  logout(): void {
    // remove user from local storage and set current user to null
    localStorage.removeItem(this.userLocalStorage);
    this.userSubject.next(null);
    // TODO navigate function in the router
    // this.router.navigate(['/account/login']);
  }

  register(user: UserRegistration): Observable<UserRegistrationResponse> {
    return this.http.post<Response<UserRegistrationResponse>>(`${environment.apiUrl}/users`, user)
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
      return of(false);
    } else {
      return this.http.put(`${environment.apiUrl}/users/${user.id}`, params)
        .pipe(map(x => {
          return true;
        }));
    }
  }

  refreshToken(): Observable<TokenRefresh> {
    const user: User | null = this.userValue;
    if (user === null) {
      return throwError('No user logged');
    }
    console.log(`${environment.apiUrl}/users/refresh`, user);
    return this.http.post<Response<TokenRefresh>>(`${environment.apiUrl}/users/refresh`, { token: user.token, refresh: user.refresh })
      .pipe(map(a => {
        user.token = a.data.token;
        user.refresh = a.data.refresh;
        console.log(user.token, a.data.token);
        this.userSubject.next(user);
        return a.data;
      }));
  }
}
