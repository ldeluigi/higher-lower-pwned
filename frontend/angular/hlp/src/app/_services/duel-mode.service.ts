import { isDataSource } from '@angular/cdk/collections';
import { OnDestroy } from '@angular/core';
import { Injectable } from '@angular/core';
import * as io from 'ngx-socket-io';
import { SocketIoConfig } from 'ngx-socket-io';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SocketDuel } from '../game/SocketDuel';
import { GameEnd } from '../game/_model/gameEnd';
import { DuelGuess, NextGuess } from '../game/_model/nextGuess';
import { AccountService } from './account.service';

@Injectable({
  providedIn: 'root'
})
export class DuelModeService implements OnDestroy {

  private gameSubject: Subject<DuelGuess>;
  game: Observable<DuelGuess>;
  connectionOpen = false;

  constructor(
    private socket: SocketDuel,
    private accountService: AccountService
  ) {

    const config: SocketIoConfig = { url: `${environment.apiUrl}/duel`, options: { autoConnect: false } };
    this.socket.ioSocket.io.config = config;

    this.gameSubject = new Subject<DuelGuess>();
    this.socket.removeAllListeners();

    this.socket.on('guess', (nextGuess: DuelGuess) => {
      console.log('>guess: ', nextGuess);
      this.gameSubject.next(nextGuess);
    });

    this.socket.on('on-error', (err: Error) => {
      console.log('>on-error: ', err);
      this.gameSubject.error(err);
    });

    this.socket.on('waiting-opponents', () => {
      console.log('>waiting-opponents: ');
      // this.gameSubject.next();
    });

    this.socket.on('player-join', () => {
      console.log('>player-join: ');
      // this.gameSubject.next(gameEnd);
    });

    this.game = this.gameSubject.asObservable();
  }

  async startGame(): Promise<void> {
    if (!this.connectionOpen) {
      this.setUpAndConnect()
        .then(_ => {
          this.socket.emit('start');
          console.log(this.socket.ioSocket.io.engine.id);
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

  private extractMyData(data: {ids: number[], data: DuelGuess[]}): DuelGuess {
    const myID: number = this.socket.ioSocket.io.engine.id;
    const myIndex = data.ids.indexOf(myID);
    if (myIndex > 0) {
      return data.data[myIndex];
    }
    return {} as DuelGuess;
  }

  private haveILost(data: {ids: number[], data: DuelGuess[]}): boolean | undefined {
    return this.extractMyData(data).lost;
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
