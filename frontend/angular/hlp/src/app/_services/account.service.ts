import { Injectable } from '@angular/core';
import { User } from '../_model/user';
import { UserRegistration, UserRegistrationResponse } from '../_model/UserRegistration';
import { Route, Router } from '@angular/router';
import { HttpClient, JsonpInterceptor } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Response } from '../_model/serverResponse';
@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private userSubject: BehaviorSubject<User>;
  private userLocalStorage = 'user';
  public user: Observable<User>;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    this.userSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem(this.userLocalStorage) || '{}'));
    this.user = this.userSubject.asObservable();
  }

  public get userValue(): User {
    return this.userSubject.value;
  }

  login(username: string, password: string): Observable<User> {
    return this.http.post<Response<User>>(`${environment.apiUrl}/users/login`, {username, password})
      .pipe(map(u => {
        localStorage.setItem(this.userLocalStorage, JSON.stringify(u.data));
        this.userSubject.next(u.data);
        return u.data;
      }));
  }

  logout(): void {
    // remove user from local storage and set current user to null
    localStorage.removeItem(this.userLocalStorage);
    this.userSubject.next({} as User);
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
    const user: User = JSON.parse(localStorage.getItem(this.userLocalStorage) || '{}');
    if (user === null) {
      return of(false);
    }
    return this.http.put(`${environment.apiUrl}/users/${user.id}`, params)
        .pipe(map(x => {
            return true;
        }));
  }

}
