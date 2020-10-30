import { OnDestroy } from '@angular/core';
import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable, Subject } from 'rxjs';
import { SocketDuel } from '../game/SocketDuel';
import { SocketRoyale } from '../game/SocketRoyale';
import { NextDuelGuess } from '../game/_model/nextguess';
import { PlayerIdName, PlayerJoin } from '../game/_model/player-join';
import { AccountService } from './account.service';
import { ApiURLService } from './api-url.service';

export interface GameData {
  ids: string[];
  data: NextDuelGuess[];
}

@Injectable({
  providedIn: 'root'
})
export class BattleModelService implements OnDestroy {

  private playersSubject: Subject<PlayerJoin | PlayerIdName>;
  private gameDataSubject: Subject<GameData>;
  private errorSubject: Subject<{ code: number, description: string }>;
  private isInGame = false;
  players: Observable<PlayerJoin | PlayerIdName>;
  gameData: Observable<GameData>;
  errors: Observable<{ code: number, description: string }>;
  connectionOpen = false;
  myId = '';

  currentSocket: Socket | undefined;

  constructor(
    // private socketDuel: SocketDuel,
    private accountService: AccountService,
    private apiURL: ApiURLService
  ) {
    // setup subject
    this.playersSubject = new Subject<PlayerJoin | PlayerIdName>();
    this.gameDataSubject = new Subject<GameData>();
    this.errorSubject = new Subject<{ code: number, description: string }>();

    // setup observable
    this.gameData = this.gameDataSubject.asObservable();
    this.players = this.playersSubject.asObservable();
    this.errors = this.errorSubject.asObservable();
  }

  private setupListener(newSocket?: Socket): void {
    if (newSocket) {
      this.currentSocket = newSocket;
    } else {
      if (this.currentSocket === undefined) {
        this.currentSocket = new SocketDuel(this.apiURL.socketApiUrl);
      }
    }
    this.currentSocket.removeAllListeners();

    this.currentSocket.on('guess', (res: GameData) => {
      console.log('>guess: ', res);
      this.gameDataSubject.next(res);
    });

    this.currentSocket.on('on-error', (err: { code: number, description: string }) => {
      console.log('>on-error: ', err);
      this.errorSubject.next(err);
    });

    const opponents = (players: { opponents: PlayerIdName[] }) => {
      console.log('>waiting-opponents: ');
      console.log(players);
      players.opponents.forEach(p => this.playersSubject.next(p));
    };

    this.currentSocket.on('waiting-opponents', opponents);
    this.currentSocket.on('opponents', opponents);

    this.currentSocket.on('player-join', (data: PlayerJoin) => {
      console.log('>player-join: ', data);
      this.playersSubject.next(data);
    });
  }

  async connect(socket: Socket): Promise<void> {
    this.setupListener(socket);
    return this.setUpAndConnect();
  }

  async startGame(socket?: Socket): Promise<void> {
    this.setupListener(socket);
    if (!this.connectionOpen) {
      this.setUpAndConnect()
        .then(_ => {
          this.currentSocket?.emit('start');
          return;
        });
    } else if (!this.isInGame) {
      this.currentSocket?.emit('start');
      return;
    }
  }

  private async setUpAndConnect(): Promise<void> {
    if (this.currentSocket) {
      if (this.accountService.userValue !== null) {
        // console.log('add token');
        this.currentSocket.ioSocket.io.opts.query = { token: this.accountService.userValue.token };
      } else {
        // console.log('remove toke');
        this.currentSocket.ioSocket.io.opts.query = {};
      }
      this.currentSocket.fromOneTimeEvent('disconnect')
        .then(_ => {
          // console.log('disconnected');
          this.connectionOpen = false;
        });
      this.currentSocket.connect();
      await this.currentSocket.fromOneTimeEvent('connect')
        .then(() => {
          this.myId = this.currentSocket?.ioSocket.io.engine.id;
        });
      this.connectionOpen = true;
      return;
    }
  }


  repeat(): void {
    if (this.connectionOpen) {
      this.currentSocket?.emit('repeat');
    }
  }

  answer(answer: number): void {
    if (this.connectionOpen) {
      this.currentSocket?.emit('answer', { higher: answer });
    }
  }

  endGame(): void {
    this.currentSocket?.emit('quit');
  }

  disconnect(): void {
    if (this.connectionOpen) {
      // console.log('disconnect');
      this.currentSocket?.disconnect();
      this.currentSocket = undefined;
    }
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
