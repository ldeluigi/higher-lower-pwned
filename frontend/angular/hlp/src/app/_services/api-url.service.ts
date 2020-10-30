import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiURLService {

  private apiURL: string | undefined;

  constructor() { }

  get restApiUrl(): string {
    return `${this.loadApiUrl}/api`;
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
      this.apiURL = 'http://192.168.99.100:8080';
    }
    return this.apiURL;
  }
}
