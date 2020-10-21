import { isDataSource } from '@angular/cdk/collections';
import { OnDestroy } from '@angular/core';
import { Injectable } from '@angular/core';
import * as io from 'ngx-socket-io';
import { SocketIoConfig } from 'ngx-socket-io';
import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { SocketDuel } from '../game/SocketDuel';
import { GameEnd } from '../game/_model/gameEnd';
import { NextDuelGuess, NextGuess } from '../game/_model/nextGuess';
import { PlayerIdName, PlayerJoin } from '../game/_model/player-join';
import { AccountService } from './account.service';

export interface GameData {
  ids: string[];
  data: NextDuelGuess[];
}

@Injectable({
  providedIn: 'root'
})
export class DuelModeService implements OnDestroy {

  private playersSubject: Subject<PlayerJoin | PlayerIdName>;
  private gameDataSubject: Subject<GameData>;
  private isInGame = false;
  players: Observable<PlayerJoin | PlayerIdName>;
  gameData: Observable<GameData>;
  connectionOpen = false;
  myId = '';

  constructor(
    private socket: SocketDuel,
    private accountService: AccountService
  ) {

    const config: SocketIoConfig = { url: `${environment.apiUrl}/duel`, options: { autoConnect: false } };
    this.socket.ioSocket.io.config = config;

    this.playersSubject = new Subject<PlayerJoin | PlayerIdName>();
    this.gameDataSubject = new Subject<GameData>();

    this.socket.removeAllListeners();

    this.socket.on('guess', (res: GameData) => {
      console.log('>guess: ', res);
      this.gameDataSubject.next(res);
    });

    this.socket.on('on-error', (err: Error) => {
      console.log('>on-error: ', err);
      this.gameDataSubject.error(err);
    });

    const opponents = (players: { opponents: PlayerIdName[]}) => {
      console.log('>waiting-opponents: ');
      console.log(players);
      players.opponents.forEach(p => this.playersSubject.next(p));
    };

    this.socket.on('waiting-opponents', opponents);
    this.socket.on('opponents', opponents);

    this.socket.on('player-join', (data: PlayerJoin) => {
      console.log('>player-join: ', data);
      this.playersSubject.next(data);
    });

    this.gameData = this.gameDataSubject.asObservable();
    this.players = this.playersSubject.asObservable();
  }

  async connect(): Promise<void> {
    return this.setUpAndConnect();
  }

  async startGame(): Promise<void> {
    if (!this.connectionOpen) {
      this.setUpAndConnect()
        .then(_ => {
          this.socket.emit('start');
          this.myId = this.socket.ioSocket.io.engine.id;
          return;
        });
    } else if (!this.isInGame) {
      this.socket.emit('start');
      return;
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

  private extractMyData(data: GameData): NextDuelGuess {
    const myID: string = this.socket.ioSocket.io.engine.id;
    const myIndex = data.ids.indexOf('/duel#' + myID);
    if (myIndex >= 0) {
      return data.data[myIndex];
    }
    return {} as NextDuelGuess;
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

  endGame(): void {
    this.socket.emit('quit');
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
