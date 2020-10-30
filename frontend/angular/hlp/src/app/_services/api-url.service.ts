import { Injectable } from '@angular/core';

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
    // TODO
    return 'http://localhost:8080';
  }
}
