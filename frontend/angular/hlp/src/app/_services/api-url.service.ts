import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiURLService {

  private apiURL: string | undefined;

  constructor() { }

  get baseApiUrl(): string {
    return this.loadApiUrl();
  }

  get restApiUrl(): string {
    return `${this.loadApiUrl()}/api`;
  }

  get socketApiUrl(): string {
    return `${this.loadApiUrl()}/socket`;
  }

  private loadApiUrl(): string {
    if (this.apiURL) {
      return this.apiURL;
    }
    if (environment.production) {
      const baseUrl = window.location.origin;
      this.apiURL = baseUrl;
    } else {
      this.apiURL = environment.apiUrl;
    }
    return this.apiURL;
  }
}
