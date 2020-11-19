import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { first } from 'rxjs/operators';
import { OnError } from '../routes/game/model/error';
import { GameEnd } from '../routes/game/model/gameEnd';
import { Guess, MultiplayerGameUpdate, NextDuelGuess, NextGuess, UpdatePlayersInfo } from '../routes/game/model/nextguess';
import { PlayerIdName, PlayerJoin } from '../routes/game/model/player-join';
import { extractId, getDataFromId } from '../routes/game/utils/gameHelper';
import { AccountService } from './account.service';
import { GameData } from '../routes/game/model/nextguess';

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

  private nextGuessSubject!: Subject<Guess>;
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

  private stopConnection = false;
  private connectionOpen = false;

  constructor(
    private accountService: AccountService,
  ) {
    this.setupObservable();
  }

  private setupObservable(): void {
    this.playersSubject = new Subject<PlayerIdName>();
    this.playerObservable = this.playersSubject.asObservable();

    this.gameDataSubject = new Subject<MultiplayerGameUpdate>();
    this.gameDataUpdate = this.gameDataSubject.asObservable();

    this.opponentsSubject = new Subject<PlayerIdName[]>();
    this.opponentsObservable = this.opponentsSubject.asObservable();

    this.nextGuessSubject = new Subject<Guess>();
    this.simpleNextGuessObservable = this.nextGuessSubject.asObservable();

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

  /**
   *
   * @param socket the socket type to use (Arcade, Duel, Royale)
   */
  async setup(socket: Socket): Promise<void> {
    this.socket?.disconnect();
    this.socket = socket;
    this.setUpSocketObservable(socket);
    await this.connect();
  }

  private async connect(): Promise<void> {
    this.stopConnection = false;
    if (this.socket === undefined) {
      return;
    }
    if (this.accountService.userValue !== null) {
      this.socket.ioSocket.io.opts.query = {
        token: this.accountService.userValue.token
      };
    } else {
      this.socket.ioSocket.io.opts.query = {};
    }
    this.socket.fromOneTimeEvent('disconnect')
      .then(_ => {
        console.log('disconect');
        this.connectionOpen = false;

      });
    this.socket.connect();
    await this.socket.fromOneTimeEvent('connect')
      .then(() => {
        if (this.stopConnection) {
          this.disconnect();
        }
        console.log('connect!');
      });
    this.connectionOpen = true;
    return;
  }

  /**
   * New guess 'guess'
   */
  private guess = (guess: NextGuess | GameData) => {
    console.log('socket guess', guess);
    const guessAsNextGuess = guess as NextGuess;  // contiene solo il guess
    const guessAsGameData = guess as GameData;    // contiene una lista di valori
    if (guessAsNextGuess.password1) {                   // Case arcade
      this.nextGuessSubject.next(guessAsNextGuess);       // call next guess
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
    console.log('socket game end', data);
    this.gameEndSubject.next(data);
  }

  /**
   *  Error in connection of any type.
   */
  private error = (e: string) => {
    console.log('>error: ', e);
    if (e === 'error-connection') {
      if (this.accountService.userValue !== null) {
        this.accountService.refreshToken().pipe(first()).subscribe(() => {
          this.startGame();
        },
          () => {
            this.accountService.logout('Can\'t connet to the service, login again and retry');
          }
        );
      } else {
        console.log('Connection lost');
        this.errorSubject.next({ code: -1, description: 'Connection lost' });
      }
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
