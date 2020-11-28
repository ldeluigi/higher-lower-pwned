import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'src/environments/environment';
import { LogLevel } from '../model/logLevel';
import { OnError } from '../routes/game/model/error';

@Injectable({
  providedIn: 'root'
})
export class LogService {

  readonly maxLogInProduction = LogLevel.All;
  private isProduction = false;

  constructor(
    private snackBar: MatSnackBar,
    ) {
    if (environment.production) {
      this.isProduction = true;
    }
  }

  log(message: string, severity: LogLevel, data: any | undefined = undefined, withDate: boolean = false): void {
    if (this.isProduction && severity > this.maxLogInProduction) {
      // skip this log in production
      return;
    }
    let value = '';
    if (withDate) {
      value = `${new Date()} - `;
    }
    value = value.concat(`[${severity.toString()}]: ${message}`);
    console.log(value, data);
  }

  messageSnackBar(message: string, duration: number = 3000): void {
    this.snackBar.open(message, undefined, { duration, panelClass: 'snackBarMessage' });
  }

  infoSnackBar(message: string, duration: number = 10000): void {
    this.snackBar.open(message, 'OK', { duration, panelClass: 'snackBarInfo' });
  }

  errorSnackBar(error: OnError | string, duration: number = 3000): void {
    const oe = error as OnError;
    let value = '';
    if (oe.code) {
      value = `[${oe.code}] ${oe.description}`;
    } else {
      value = error.toString();
    }
    this.snackBar.open(value, undefined, { duration, panelClass: 'snackBarError' });
  }
}
