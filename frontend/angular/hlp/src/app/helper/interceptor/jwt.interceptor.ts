import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AccountService } from '../../services/account.service';
import { ApiURLService } from 'src/app/services/api-url.service';

@Injectable()
export class JWTInterceptor implements HttpInterceptor {

  constructor(private accountService: AccountService, private apiURL: ApiURLService) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // add auth header with jwt if user is logged in and request is to the api url
    const user = this.accountService.userValue;
    if (user === null) {
      return next.handle(request);
    }
    const isLoggedIn = user && user.token;
    const isApiUrl = request.url.startsWith(this.apiURL.baseApiUrl);
    if (isLoggedIn && isApiUrl) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${user.token}`
        }
      });
    }

    return next.handle(request);
  }
}
