import { Injectable, OnDestroy } from '@angular/core';
import * as io from 'ngx-socket-io';
import { Error } from '../game/_model/error';
import { GameEnd } from '../game/_model/gameEnd';
import { NextGuess } from '../game/_model/nextGuess';
import { Observable, BehaviorSubject } from 'rxjs';
import { AccountService } from './account.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GameSocketService implements OnDestroy {
  public game: Observable<GameEnd | NextGuess>;

  constructor(
    private socket: io.Socket,
    private accountService: AccountService
    ) {
    this.game = new Observable<GameEnd | NextGuess>((s) => {
      this.socket.on('guess', (nextGuess: NextGuess) => {
        console.log('>guess: ', nextGuess);
        s.next(nextGuess);
      });
      this.socket.on('onerror', (err: Error) => {
        console.log('>onerror: ', err);
        s.error(err);
      });
      this.socket.on('gameEnd', (gameEnd: GameEnd) => {
        console.log('>gameEnd: ', gameEnd);
        s.next(gameEnd);
      });
    });
  }

  startGame(): void {
    if (this.accountService.userValue !== null) {
      console.log('add token');
      this.socket.ioSocket.io.opts.query = { token: this.accountService.userValue.token };
    } else {
      console.log('remove toke');
      this.socket.ioSocket.io.opts.query = { };
    }
    this.socket.connect();
    this.socket.emit('start');
  }

  repeat(): void {
    this.socket.emit('repeat');
  }

  answer(answer: number): void {
    this.socket.emit('answer', {higher: answer});
  }

  disconnect(): void {
    console.log('disconnect');
    this.socket.disconnect();
    this.socket.removeAllListeners();
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
