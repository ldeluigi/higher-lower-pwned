import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KeyPressDistributionService {

  private keyEventSubject = new Subject<KeyboardEvent>();
  keyEventObs: Observable<KeyboardEvent> = this.keyEventSubject.asObservable();

  constructor() { }

  public distributeKeyPress(keyValue: KeyboardEvent): void {
    this.keyEventSubject.next(keyValue);
  }
}
