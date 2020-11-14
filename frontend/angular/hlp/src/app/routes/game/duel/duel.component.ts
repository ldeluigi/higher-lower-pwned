import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Socket } from 'ngx-socket-io';
import { Subscription, interval } from 'rxjs';
import { AccountService } from 'src/app/services/account.service';
import { ApiURLService } from 'src/app/services/api-url.service';
import { BattleModelService, GameData } from 'src/app/services/battle-model.service';
import { WordSpinnerComponent } from '../components/word-spinner/word-spinner.component';
import { NextDuelGuess } from '../model/nextguess';
import { SocketDuel } from '../SocketDuel';
import { Game, getDataFromId, GameDataType, gameDataType, gameIsEnd } from '../utils/gameHelper';
import { GameStatus } from '../utils/gameStatus';

@Component({
  selector: 'app-duel',
  templateUrl: './duel.component.html',
  styleUrls: ['./duel.component.scss']
})
export class DuelComponent implements OnInit, OnDestroy {

  @ViewChild(WordSpinnerComponent)
  private wordAnimation!: WordSpinnerComponent;

  private game: Game = new Game();
  gameSub: Subscription | undefined;

  actualScore = 0;
  name = 'YOU';
  opponentScore = 0;
  opponentName = 'OPPONENT';
  opponentLost = false;

  gameStatus = GameStatus.IDLE;
  status = GameStatus;

  private timeoutValue: number | undefined;

  progressbarValue = 100;
  timeLeft = 0;
  private subTimer: Subscription | undefined;

  constructor(
    private gameSocket: BattleModelService,
    private snackBar: MatSnackBar,
    private apiURL: ApiURLService,
    private accountService: AccountService
  ) {
    this.name = this.accountService.userValue?.username || 'YOU';
  }

  private socket(): Socket {
    return new SocketDuel(this.apiURL.socketApiUrl);
  }

  ngOnInit(): void {
    this.game = new Game();
    this.gameSub = new Subscription();
    this.gameSub.add(
      this.game.nextGuessObservable.subscribe(card => {
        if (this.gameStatus === GameStatus.WAITING_START) { // game start
          this.wordAnimation.gameSetup(card)
            .then(() => {
              this.gameStatus = GameStatus.PLAYING;
            });
        } else if (this.isInGame() && this.game.status === GameStatus.PLAYING) { // in game
          this.wordAnimation.next({ oldScore: card.score1, newWord: card.word2 })
            .then(() => {
              this.gameStatus = GameStatus.PLAYING;
            });
        } else if (this.isInGame() && this.game.status === GameStatus.SPECTATORE) { // have lost now
          this.gameStatus = GameStatus.LOST;
          this.log('You have lost');
          this.endGame(card.score1);  // take the old value
        } else if (this.game.status === GameStatus.SPECTATORE && this.gameStatus === GameStatus.SPECTATORE) { // spectatore mode
          this.wordAnimation.next({ oldScore: card.score1, newWord: card.word2 });
        } else if (this.game.status === GameStatus.END) {
          if (this.isInGame() || this.gameStatus === GameStatus.SPECTATORE) {
            this.endGame(this.game.myLastGuess?.score2 || 0);
          }
          if (this.gameStatus !== GameStatus.END) {
            this.log('This game is ended');
          }
          this.gameStatus = GameStatus.END;
        }
      })
    );

    this.gameSub.add(this.game.timerObservable.subscribe(timer => {
      if (this.isInGame() || this.gameStatus === GameStatus.WAITING_START) {
        this.setProgressBarTimer(timer);
      }
    }));

    this.gameSub.add(this.gameSocket.players.subscribe(pj => {
      if (pj.id.includes(this.gameSocket.myId)) {
        const accountName = this.accountService.userValue?.username;
        this.name = accountName ? accountName : pj.name;
      } else {
        this.opponentName = pj.name;
      }
    }));

    this.gameSub.add(this.gameSocket.gameData.subscribe(data => {
      this.analiseGuess(data);
    }));

    this.gameSub.add(this.gameSocket.errors.subscribe(err => this.log(`code:[${err.code}] desc:[${err.description}]`)));
  }

  log(message: string, type: string = 'ok'): void {
    this.snackBar.open(message, type, { duration: 5000 });
  }

  ngOnDestroy(): void {
    this.disconnect();
    this.gameSocket.disconnect();
    this.gameSub?.unsubscribe();
    this.gameSub = undefined;
  }

  answer(value: number): void {
    this.gameSocket.answer(value);
    this.subTimer?.unsubscribe();
    this.subTimer = undefined;
    this.gameStatus = GameStatus.WAITING_N_GUESS;
  }

  private resetPlayersData(): void {
    this.actualScore = 0;
    this.opponentScore = 0;
    this.name = this.accountService.userValue?.username || 'YOU';
    this.opponentName = 'OPPONENT';
  }

  start(): void {
    this.game.reset();
    this.resetPlayersData();
    this.actualScore = 0;
    this.gameSocket.startGame(this.socket())
      .then(() => {
        this.gameStatus = GameStatus.WAITING_START;
      })
      .catch(() => {
        this.log('Impossible start a new game');
        this.gameStatus = GameStatus.IDLE;
      });
  }

  private onEnd(): void {
    if (this.gameStatus === GameStatus.PLAYING || this.gameStatus === GameStatus.WAITING_N_GUESS) {
      this.gameStatus = GameStatus.LOST;
      if (this.timeoutValue) {
        clearTimeout(this.timeoutValue);
      }
      this.subTimer?.unsubscribe();
      this.subTimer = undefined;
    }
  }

  quit(): void {
    this.onEnd();
    this.gameSocket.endGame();
  }

  disconnect(): void {
    this.onEnd();
    this.gameStatus = GameStatus.IDLE;
    this.resetPlayersData();
    this.gameSocket.disconnect();
  }

  spectatoreMode(): void {
    if (this.gameStatus === GameStatus.LOST) {
      this.gameStatus = GameStatus.SPECTATORE;
      const lastCard = this.game.currentGuess;
      if (lastCard) {
        if (this.wordAnimation.element1.word === lastCard?.word1) {
          /** nothing */
        } else if (this.wordAnimation.element2.word === lastCard?.word1) {
          this.wordAnimation.next({ oldScore: lastCard.score1, newWord: lastCard.word2 });
        } else {
          this.wordAnimation.gameSetup(lastCard);
        }
      }
    }
  }

  repeat(): void {
    this.gameSocket.repeat();
  }

  private endGame(value2: number): void {
    this.onEnd();
    this.wordAnimation.end({ oldScore: value2 });
  }

  isInGame(): boolean {
    return this.gameStatus === GameStatus.PLAYING || this.gameStatus === GameStatus.WAITING_N_GUESS;
  }

  private analiseGuess(data: GameData): void {
    const myGuess: NextDuelGuess = getDataFromId(this.gameSocket.myId, data);
    const gameType: GameDataType = gameDataType(data, this.game.currentGuess?.word2);
    this.game.next(myGuess, gameType);

    this.updateGameDuel(data);

    if (gameIsEnd(data)) { /** everybody have lost */
      this.gameStatus = GameStatus.END;
    }
  }

  private updateGameDuel(data: GameData): void {
    data.ids.forEach((id: string, index) => {
      if (id.includes(this.gameSocket.myId)) { // player data
        const playerData = data.data[index];
        if (playerData.score) {
          this.actualScore = playerData.score;
        }
      } else { // opponents data
        const playerData = data.data[index];
        if (playerData.lost !== undefined) {
          this.opponentLost = playerData.lost;
        }
        if (playerData.score) {
          this.opponentScore = playerData.score;
        }
      }
    });
  }

  private async setProgressBarTimer(milliseconds: number): Promise<void> {
    const progressBarMax = 100;
    const frames = 200;
    const delta = progressBarMax / frames;
    const deltaT = Math.floor(milliseconds / frames);
    const timer$ = interval(deltaT);

    if (this.subTimer) {
      this.subTimer.unsubscribe();
    }

    return new Promise<void>(resolve => {
      this.subTimer = timer$.subscribe((d) => {
        const currentValue = delta * d;
        const currentMillis = deltaT * d;
        this.timeLeft = milliseconds - currentMillis;
        this.progressbarValue = progressBarMax - currentValue;
        if (this.timeLeft <= 0 && this.subTimer) {
          this.subTimer.unsubscribe();
          this.subTimer = undefined;
          this.progressbarValue = 0;
          this.timeLeft = 0;
          resolve();
        }
      });
    });
  }

}
