import { Injectable, OnDestroy } from '@angular/core';
import * as io from 'ngx-socket-io';
import { Error } from '../game/_model/error';
import { GameEnd } from '../game/_model/gameEnd';
import { NextGuess } from '../game/_model/nextGuess';
import { Observable, BehaviorSubject } from 'rxjs';
import { AccountService } from './account.service';

@Injectable({
  providedIn: 'root',
})
export class GameSocketService implements OnDestroy {
  public game: Observable<GameEnd | NextGuess>;
  private connectionOpen = false;

  constructor(
    private socket: io.Socket,
    private accountService: AccountService
  ) {
    this.game = new Observable<GameEnd | NextGuess>((s) => {
      this.socket.removeAllListeners();
      this.socket.on('guess', (nextGuess: NextGuess) => {
        // console.log('>guess: ', nextGuess);
        s.next(nextGuess);
      });
      this.socket.on('onerror', (err: Error) => {
        // console.log('>onerror: ', err);
        s.error(err);
      });
      this.socket.on('gameEnd', (gameEnd: GameEnd) => {
        // console.log('>gameEnd: ', gameEnd);
        s.next(gameEnd);
      });
      this.socket.on('error', (e: string) => {
        // console.log('>error: ', e);
        if (e === 'error-connection') {
          if (this.accountService.userValue !== null) {
            this.accountService.refreshToken().subscribe(t => {
              this.startGame();
            });
          } else {
            s.error('Connection lost');
          }
        }
      });
    });
  }

  startGame(): void {
    if (!this.connectionOpen) {
      this.setUpAndConnect()
        .then(_ => {
          this.socket.emit('start');
        });
    } else { // connection already up
      // console.log('game alreay started');
    }
  }

  private async setUpAndConnect(): Promise<unknown> {
    if (this.accountService.userValue !== null) {
      // console.log('add token');
      this.socket.ioSocket.io.opts.query = { token: this.accountService.userValue.token };
    } else {
      // console.log('remove toke');
      this.socket.ioSocket.io.opts.query = {};
    }
    this.socket.fromOneTimeEvent('disconnect')
    .then(_ => {
      // console.log('disconnected');
      this.connectionOpen = false;
    });
    this.socket.connect();
    await this.socket.fromOneTimeEvent('connect');
    this.connectionOpen = true;
    return;
  }

  repeat(): void {
    if (this.connectionOpen) {
      this.socket.emit('repeat');
    }
  }

  answer(answer: number): void {
    if (this.connectionOpen) {
      this.socket.emit('answer', { higher: answer });
    }
  }

  disconnect(): void {
    if (this.connectionOpen) {
      // console.log('disconnect');
      this.socket.disconnect();
    }
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
