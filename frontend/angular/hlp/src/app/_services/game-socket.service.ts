import { Injectable, OnDestroy } from '@angular/core';
// import * as io from 'ngx-socket-io';
import { Error } from '../game/_model/error';
import { GameEnd } from '../game/_model/gameEnd';
import { NextGuess } from '../game/_model/nextGuess';
import { Observable } from 'rxjs';
import { AccountService } from './account.service';
import { SocketArcade } from '../game/SocketArcade';

@Injectable({
  providedIn: 'root',
})
export class GameSocketService implements OnDestroy {
  public game: Observable<GameEnd | NextGuess>;
  private connectionOpen = false;

  constructor(
    private socket: SocketArcade,
    private accountService: AccountService
  ) {
    console.log(socket);
    this.game = new Observable<GameEnd | NextGuess>((s) => {
      this.socket.removeAllListeners();
      this.socket.on('guess', (nextGuess: NextGuess) => {
        // console.log('>guess: ', nextGuess);
        s.next(nextGuess);
      });
      this.socket.on('on-error', (err: Error) => {
        // console.log('>on-error: ', err);
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
            },
            error => {
              this.accountService.logout('Can\'t connet to the service, login again and retry');
            }
            );
          } else {
            s.error('Connection lost');
          }
        }
      });
    });
  }

  async startGame(): Promise<void> {
    if (!this.connectionOpen) {
      this.setUpAndConnect()
        .then(_ => {
          this.socket.emit('start');
        });
    } else { // connection already up
      // console.log('game alreay started');
    }
  }

  private async setUpAndConnect(): Promise<void> {
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
