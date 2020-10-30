import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiURLService {

  private apiURL: string | undefined;

  constructor() { }

  baseApiUrl(): string {
    return this.loadApiUrl();
  }

  restApiUrl(): string {
    return this.loadApiUrl() + '/api';
  }

  socketApiUrl(): string {
    return this.loadApiUrl() + '/socket';
  }

  private loadApiUrl(): string {
    if (this.apiURL) {
      return this.apiURL;
    }
    if (environment.production) {
      const baseUrl = window.location.origin;
      this.apiURL = baseUrl;
    } else {
      this.apiURL = 'http://localhost:8080';
    }
    return this.apiURL;
  }
}
