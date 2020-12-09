import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { first } from 'rxjs/operators';
import { ARCADE, DUEL, ROYALE } from '../routes/game/model/gameModes';
import { errorToString, OnError } from '../routes/game/model/error';
import {
  GameData, Guess, MultiplayerGameUpdate, NextMultiplayerGuess, NextGuess,
  UpdatePlayersInfo, GameEndDTO, GameEnd, DRAW, LOSE, WON
} from '../routes/game/model/gameDTO';
import { PlayerIdName, PlayerJoin, PlayerLeave } from '../routes/game/model/player-join';
import { SocketArcade } from '../routes/game/SocketArcade';
import { SocketDuel } from '../routes/game/SocketDuel';
import { SocketRoyale } from '../routes/game/SocketRoyale';
import { extractId, getDataFromId } from '../routes/game/utils/gameHelper';
import { AccountService } from './account.service';
import { ApiURLService } from './api-url.service';
import { LogService } from './log.service';
import { LogLevel } from '../model/logLevel';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class GameSocketService {

  private playersSubject!: Subject<PlayerIdName>;
  /// Identify player join event in multiplayer mode.
  playerObservable!: Observable<PlayerIdName>;

  private gameDataSubject!: Subject<MultiplayerGameUpdate>;
  /// Emit event on game data update (only for multiplayer mode)
  gameDataUpdate!: Observable<MultiplayerGameUpdate>;

  private opponentsSubject!: Subject<PlayerIdName[]>;
  /// Emit event when opponents list is available (only for multiplayer mode)
  opponentsObservable!: Observable<PlayerIdName[]>;

  private simpleNextGuessSubject!: Subject<Guess>;
  /// Emit next guess, valid for every mode (contain only, psw1, psw2, and val1)
  simpleNextGuessObservable!: Observable<Guess>;

  private timerSubject!: Subject<number>;
  /// Emit the timer value for the current player every time a new timer is recived
  timerObservable!: Observable<number>;

  private userScoreSubject!: Subject<number>;
  /// Emit the score of the user
  userScoreObservable!: Observable<number>;

  private nextBattleGuessSubject!: Subject<NextMultiplayerGuess>;
  /// Emit event only in DUEL and ROYALE mode
  nextBattleGuessObservable!: Observable<NextMultiplayerGuess>;

  private gameEndSubject!: Subject<GameEnd>;
  /// Emit the last state
  gameEndObservable!: Observable<GameEnd>;

  private errorSubject!: Subject<OnError>;
  /// Emit errors from the server
  errorObservable!: Observable<OnError>;

  private playerLeaveSubject: Subject<PlayerLeave>;
  /// Emit the id of any player that leave a game (duel or royale)
  playerLeaveObservable: Observable<PlayerLeave>;

  private socket: Socket | undefined;

  private connectionTry = 0;
  private connectionSubject: Subject<boolean> | undefined;
  private stopConnection = false;
  connectionOpen = false;
  private gameMode = '';

  constructor(
    private accountService: AccountService,
    private apiURL: ApiURLService,
    private logService: LogService,
    private router: Router,
  ) {
    this.playersSubject = new Subject<PlayerIdName>();
    this.playerObservable = this.playersSubject.asObservable();

    this.gameDataSubject = new Subject<MultiplayerGameUpdate>();
    this.gameDataUpdate = this.gameDataSubject.asObservable();

    this.opponentsSubject = new Subject<PlayerIdName[]>();
    this.opponentsObservable = this.opponentsSubject.asObservable();

    this.simpleNextGuessSubject = new Subject<Guess>();
    this.simpleNextGuessObservable = this.simpleNextGuessSubject.asObservable();

    this.nextBattleGuessSubject = new Subject<NextMultiplayerGuess>();
    this.nextBattleGuessObservable = this.nextBattleGuessSubject.asObservable();

    this.timerSubject = new Subject<number>();
    this.timerObservable = this.timerSubject.asObservable();

    this.userScoreSubject = new Subject<number>();
    this.userScoreObservable = this.userScoreSubject.asObservable();

    this.errorSubject = new Subject<OnError>();
    this.errorObservable = this.errorSubject.asObservable();

    this.gameEndSubject = new Subject<GameEnd>();
    this.gameEndObservable = this.gameEndSubject.asObservable();

    this.playerLeaveSubject = new Subject<PlayerLeave>();
    this.playerLeaveObservable = this.playerLeaveSubject.asObservable();
  }

  private setUpSocketObservable(socket: Socket): void {
    socket.on('guess', this.guess);
    socket.on('on-error', this.onError);
    socket.on('waiting-opponents', this.opponents);
    socket.on('player-join', this.playerJoin);
    socket.on('game-end', this.gameEnd);
    socket.on('player-leave', this.playerLeave);
    socket.on('error', this.error);
  }

  disconnect(): void {
    this.stopConnection = true;
    this.socket?.emit('quit');
    this.logService.log('EMIT QUIT!', LogLevel.Info);
    this.socket?.disconnect();
    this.socket?.removeAllListeners();
    this.socket = undefined;
  }

  get socketId(): string {
    return this.socket?.ioSocket.io.engine.id;
  }

  private newSocket(gameMode: string): Socket {
    let socket: Socket;
    this.gameMode = gameMode;
    switch (gameMode) {
      case ARCADE:
        socket = new SocketArcade(this.apiURL.socketApiUrl);
        break;
      case DUEL:
        socket = new SocketDuel(this.apiURL.socketApiUrl);
        break;
      case ROYALE:
        socket = new SocketRoyale(this.apiURL.socketApiUrl);
        break;
      default:
        throw new Error(`Illegal argument [${gameMode}]`);
    }
    return socket;
  }

  /**
   *
   * @param socket the socket type to use (Arcade, Duel, Royale)
   */
  setup(gameMode: string): Observable<boolean> {
    this.connectionTry = 0;
    this.socket?.disconnect();
    this.socket = this.newSocket(gameMode);
    this.setUpSocketObservable(this.socket);
    return this.connect(this.socket);
  }

  private connect(socket: Socket): Observable<boolean> {
    if (this.connectionSubject === undefined) {
      this.connectionSubject = new Subject<boolean>();
    }
    this.stopConnection = false;
    if (socket === undefined) {
      this.connectionSubject.next(false);
    } else {
      if (this.accountService.userValue !== null) {
        socket.ioSocket.io.opts.query = {
          token: this.accountService.userValue.token
        };
      } else {
        socket.ioSocket.io.opts.query = {};
      }
      socket.fromOneTimeEvent('disconnect')
        .then(_ => {
          this.logService.log('Socket disconected.', LogLevel.Info);
          this.connectionOpen = false;
        });
      socket.connect();
      socket.fromOneTimeEvent('connect')
        .then(() => {
          if (this.stopConnection) {
            this.disconnect();
            return;
          }
          this.logService.log('Socket connect.', LogLevel.Info);
          this.connectionSubject?.next(true);
          this.connectionSubject = undefined;
        });
      this.connectionOpen = true;
    }
    return this.connectionSubject.asObservable();
  }

  /**
   * New guess 'guess'
   */
  private guess = (guess: NextGuess | GameData) => {
    this.logService.log('Socket guess ', LogLevel.Info, false, guess);
    const guessAsNextGuess = guess as NextGuess;  // contiene solo il guess
    const guessAsGameData = guess as GameData;    // contiene una lista di valori
    if (guessAsNextGuess.password1) {                   // Case arcade
      this.simpleNextGuessSubject.next(guessAsNextGuess);       // call next guess
      if (guessAsNextGuess.score) {
        const playerScore = guessAsNextGuess.score;
        this.userScoreSubject.next(playerScore);          // update score
      }
      if (guessAsNextGuess.timeout) {
        this.timerSubject.next(guessAsNextGuess.timeout); // update timeout value
      }
    } else if (guessAsGameData.ids) {                  // Case multiplayer
      const gameData = guessAsGameData.data;
      const playersInfo: UpdatePlayersInfo[] = [];
      guessAsGameData.ids.forEach((elem, index) => {
        const cgd = gameData[index];
        playersInfo.push({
          id: elem,
          guesses: cgd.guesses,
          lost: cgd.lost || false,
          score: cgd.score
        });
      });
      this.gameDataSubject.next({ users: playersInfo });     // update players status
      const myId = extractId(guessAsGameData.ids, this.socketId);
      if (myId) {
        const myData = getDataFromId(this.socketId, guessAsGameData);
        if (myData.score) {
          this.userScoreSubject.next(myData.score);           // update score
        }
        if (myData.timeout) {
          this.timerSubject.next(myData.timeout);             // update timer
        }
        if (gameData.every(d => d.lost === true)) {           // every one have lost
          const ges = gameData.map(e => e as GameEndDTO);
          const myDataEndGame = myData as GameEnd;
          this.logService.log('GameEndDTO: ' + ges, LogLevel.Debug);
          if (ges.filter(e => e.won).length > 1) {
            myDataEndGame.gameEndStatus = (myData as GameEndDTO).won ? DRAW : LOSE;
          } else {
            myDataEndGame.gameEndStatus = (myData as GameEndDTO).won ? WON : LOSE;
          }
          this.gameEndSubject.next(myDataEndGame);
          this.logService.log('End game message sent!', LogLevel.Debug, false, myData as GameEndDTO);
        } else {
          this.nextBattleGuessSubject.next(myData);                 // update next guess
        }
      }
    }
  }

  /**
   * Error 'on-error'
   */
  private onError = (error: OnError) => {
    this.logService.log(errorToString(error), LogLevel.Error);
    this.logService.errorSnackBar(error);
    this.router.navigate(['/home']);
  }

  /**
   * Player-join 'player-join'
   */
  private playerJoin = (data: PlayerJoin) => {
    console.log("PLAYER JOIN", data)
    this.playersSubject.next(data);
  }

  /**
   *
   */
  private playerLeave = (data: PlayerLeave) => this.playerLeaveSubject.next(data);

  /**
   * Opponents: list with all players 'opponents'
   */
  private opponents = (players: { opponents: PlayerIdName[] }) => this.opponentsSubject.next(players.opponents);

  /**
   * GameEnd: 'game-end'
   */
  private gameEnd = (data: GameEnd) => {
    this.logService.log('Recive game end message from socket', LogLevel.Debug);
    this.gameEndSubject.next(data);
  }

  /**
   *  Error in connection of any type.
   */
  private error = (e: string) => {
    this.logService.log('Socket error ' + e, LogLevel.Error);
    if (this.connectionTry > 2) {
      this.accountService.logout('Can\'t connecto to the server.');
      return;
    }
    if (this.accountService.userValue !== null && e.indexOf('jwt') >= 0) {
      this.connectionTry++;
      this.accountService.refreshToken().pipe(first()).subscribe(
        (_) => {
          if (this.socket) {
            // this.socket.disconnect();
            this.socket = this.newSocket(this.gameMode);
            this.setUpSocketObservable(this.socket);
            this.connect(this.socket);
          } else { }
        },
        e2 => this.logService.errorSnackBar(`Can't connect with your account, please login again and retry. ` + e2)
      );
    } else {
      this.errorSubject.next({ code: -1, description: 'Connection lost' });
    }
  }

  repeat(): void {
    if (this.connectionOpen) {
      this.socket?.emit('repeat');
    }
  }

  answer(answer: number): void {
    if (this.connectionOpen) {
      this.socket?.emit('answer', { higher: answer });
    }
  }

  startGame(): void {
    this.socket?.emit('start');
  }
}
