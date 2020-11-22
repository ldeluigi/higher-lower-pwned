import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { first } from 'rxjs/operators';
import { ARCADE, DUEL, ROYALE } from '../routes/game/model/const';
import { OnError } from '../routes/game/model/error';
import { GameEnd } from '../routes/game/model/gameEnd';
import { GameData, Guess, MultiplayerGameUpdate, NextDuelGuess, NextGuess, UpdatePlayersInfo } from '../routes/game/model/nextguess';
import { PlayerIdName, PlayerJoin } from '../routes/game/model/player-join';
import { SocketArcade } from '../routes/game/SocketArcade';
import { SocketDuel } from '../routes/game/SocketDuel';
import { SocketRoyale } from '../routes/game/SocketRoyale';
import { extractId, getDataFromId } from '../routes/game/utils/gameHelper';
import { AccountService } from './account.service';
import { ApiURLService } from './api-url.service';

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

  private nextBattleGuessSubject!: Subject<NextDuelGuess>;
  /// Emit event only in DUEL and ROYALE mode
  nextBattleGuessObservable!: Observable<NextDuelGuess>;

  private gameEndSubject!: Subject<GameEnd>;
  /// Emit the last state
  gameEndObservable!: Observable<GameEnd>;

  private errorSubject!: Subject<OnError>;
  /// Emit errors from the server
  errorObservable!: Observable<OnError>;

  private socket: Socket | undefined;

  private connectionTry = 0;
  private connectionSubject: Subject<boolean> | undefined;
  private stopConnection = false;
  connectionOpen = false;
  private gameMode = '';

  constructor(
    private accountService: AccountService,
    private apiURL: ApiURLService
  ) {
    this.playersSubject = new Subject<PlayerIdName>();
    this.playerObservable = this.playersSubject.asObservable();

    this.gameDataSubject = new Subject<MultiplayerGameUpdate>();
    this.gameDataUpdate = this.gameDataSubject.asObservable();

    this.opponentsSubject = new Subject<PlayerIdName[]>();
    this.opponentsObservable = this.opponentsSubject.asObservable();

    this.simpleNextGuessSubject = new Subject<Guess>();
    this.simpleNextGuessObservable = this.simpleNextGuessSubject.asObservable();

    this.nextBattleGuessSubject = new Subject<NextDuelGuess>();
    this.nextBattleGuessObservable = this.nextBattleGuessSubject.asObservable();

    this.timerSubject = new Subject<number>();
    this.timerObservable = this.timerSubject.asObservable();

    this.userScoreSubject = new Subject<number>();
    this.userScoreObservable = this.userScoreSubject.asObservable();

    this.errorSubject = new Subject<OnError>();
    this.errorObservable = this.errorSubject.asObservable();

    this.gameEndSubject = new Subject<GameEnd>();
    this.gameEndObservable = this.gameEndSubject.asObservable();
  }

  private setUpSocketObservable(socket: Socket): void {
    socket.on('guess', this.guess);
    socket.on('on-error', this.onError);
    socket.on('waiting-opponents', this.opponents);
    socket.on('player-join', this.playerJoin);
    socket.on('game-end', this.gameEnd);
    socket.on('error', this.error);
  }

  disconnect(): void {
    this.stopConnection = true;
    this.socket?.removeAllListeners();
    this.socket?.disconnect();
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
        console.log('disconect'); // TODO remove
        this.connectionOpen = false;
      });
      socket.connect();
      socket.fromOneTimeEvent('connect')
      .then(() => {
        if (this.stopConnection) {
          this.disconnect();
          return;
        }
        console.log('connect!'); // TODO remove
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
    console.log('socket guess', guess);
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
      this.gameDataSubject.next({users: playersInfo });     // update players status
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
          this.gameEndSubject.next(myData as GameEnd);
        } else {
          this.nextBattleGuessSubject.next(myData);                 // update next guess
        }
      }
    }
  }

  /**
   * Error 'on-error'
   * // TODO gestire l'errore
   */
  private onError = (error: OnError) => console.log(error);

  /**
   * Player-join 'player-join'
   */
  private playerJoin = (data: PlayerJoin) => this.playersSubject.next(data);

  /**
   * Opponents: list with all players 'opponents'
   */
  private opponents = (players: { opponents: PlayerIdName[] }) => this.opponentsSubject.next(players.opponents);

  /**
   * GameEnd: 'game-end'
   */
  private gameEnd = (data: GameEnd) => {
    // console.log('socket game end', data);
    this.gameEndSubject.next(data);
  }

  /**
   *  Error in connection of any type.
   */
  private error = (e: string) => {
    // console.log('>error: ', e, this.accountService);
    if (this.connectionTry > 2) {
      this.accountService.logout('Can\'t connecto to the server.'); // TODO cambiare con un error service
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
          } else {
            // TODO gestire l'errore
          }
        },
        e2 => this.accountService.logout('Can\'t connet to the service, login again and retry ' + e2)
      );
    } else {
      // console.log('Connection lost');
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