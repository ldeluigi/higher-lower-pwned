import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AnimationEvent } from '@angular/animations';
import { rollNumber, rollWord } from '../../utils/wordAnimation';
import { cardAnimation, vsAnimation, wordAnimation } from './animation';
import { GameSetup, EndGame, NextCard } from '../../model/animation';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { GameSocketService } from 'src/app/services/game-socket.service';
import { GameManagerService } from 'src/app/services/game-manager.service';
import { GameStatus } from '../../utils/gameStatus';
import { Subscription } from 'rxjs';
import { FlowManager } from '../../utils/gameFlowHelper';
import { debounceTime, filter, first, takeWhile } from 'rxjs/operators';

export interface Card {
  word: string;
  score: string;
  status: string;
}

@Component({
  selector: 'app-word-spinner',
  templateUrl: './word-spinner.component.html',
  styleUrls: ['./word-spinner.component.scss'],
  animations: [
    vsAnimation,
    wordAnimation,
    cardAnimation,
  ]
})
export class WordSpinnerComponent {
  private sub!: Subscription;
  private gameHelper = new FlowManager();
  moving = false;
  private answered = false;
  private inAnimation = false;
  private first = true;
  private currentFirstPassword: string | undefined;

  private answerEmitter = new EventEmitter<number>();

  lastAnswered: number | undefined;
  emptyScore = '******';
  element1: Card = {
    word: 'w1',
    score: '0',
    status: 'void'
  };
  element2: Card = {
    word: 'w2',
    score: '0',
    status: 'void'
  };
  newElement: Card = {
    word: 'w2',
    score: '0',
    status: 'void'
  };
  rotateVs = true;

  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private socketService: GameSocketService,
    private gameManagerService: GameManagerService

  ) {
    this.matIconRegistry.addSvgIcon(
      'punch_vs',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/recycle.svg')
    );
    this.matIconRegistry.addSvgIcon(
      'arrows',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/double-arrow.svg')
    );
    this.setup();
  }

  private resetCard(): void {
    this.element1.status = 'void';
    this.element2.status = 'void';
    this.newElement.status = 'void';
  }

  private setup(): void {
    this.currentFirstPassword = undefined;
    this.first = true;
    this.sub = this.gameManagerService.nextGuessObservable
      .pipe(filter(p => p.password1 !== this.currentFirstPassword))
      .subscribe(ng => {
        this.currentFirstPassword = ng.password1;
        console.log('recived in word-spinner', ng);
        if (this.first) {
          this.first = false;
          this.gameSetup({ word1: ng.password1, word2: ng.password2, score1: ng.value1 });
        } else if (ng.password1 === this.element1.word) {
          console.log('next guess word spinner skipped', ng);
          // nothing
        } else {
          console.log('next guess word spinner next', ng);
          this.next({ oldScore: ng.value1, newWord: ng.password2 });
        }
    });
    this.sub.add(this.socketService.gameEndObservable.subscribe(ge => {
      this.end({ oldScore: ge.value2 });
    }));
    this.sub.add(this.gameManagerService.gameStatusObservable.subscribe(nv => {
      if (this.gameHelper.newState(nv)) {
        this.resetCard();
        this.sub.unsubscribe();
        this.setup();
      }
    }));

    this.sub.add(
      this.answerEmitter.pipe(debounceTime(100)).subscribe(wn => {
        if (this.gameManagerService.currentGameStatus === GameStatus.PLAYING && !this.answered && !this.inAnimation) {
          this.answered = true;
          this.lastAnswered = wn;
          this.gameManagerService.gameStatusObservable.pipe(takeWhile(e => e === GameStatus.PLAYING)).subscribe(e => {
            if (e === GameStatus.PLAYING) {
              this.answered = false;
              this.lastAnswered = undefined;
            }
          });
          this.gameManagerService.answer(wn);
        }
      })
    );
  }

  get isWaitingOpponents(): boolean {
    return this.gameManagerService.currentGameStatus === GameStatus.WAITING_START;
  }

  answer(wn: number): void {
    this.answerEmitter.emit(wn);
  }

  get playerHaveLost(): boolean {
    const cgs = this.gameManagerService.currentGameStatus;
    return cgs === GameStatus.LOST || cgs === GameStatus.END;
  }

  get botCardClass(): string {
    const data: string[] = [];
    if (this.playerHaveLost) {
      data.push('lost');
    }
    if (this.moving) {
      data.push('moving');
    } else {
      data.push('not-moving');
    }
    if (this.lastAnswered === 2) {
      data.push('selected');
    }
    return data.join(' ');
  }

  get topCardClass(): string {
    const data: string[] = [];
    if (this.playerHaveLost) {
      data.push('lost');
    }
    if (this.lastAnswered === 1) {
      data.push('selected');
    }
    return data.join(' ');
  }

  private rollVS(): void {
    if (!this.inAnimation) {
      this.rotateVs = !this.rotateVs;
    }
  }

  gameSetup(setup: GameSetup): void {
    console.log('game set up');
    this.moving = false;
    this.inAnimation = true;
    this.element1 = {
      word: setup.word1,
      score: setup.score1.toString(),
      status: 'start1'
    };
    this.element2 = {
      word: setup.word2,
      score: this.emptyScore,
      status: 'start2'
    };
  }

  next(next: NextCard): void {
    if (this.element2.word === next.newWord) {
      return;
    }
    this.moving = true;
    this.inAnimation = true;
    rollNumber(next.oldScore, 600, (n) => this.element2.score = n.toString())
      .then(() => {
        this.rollVS();
        this.newElement = {
          word: next.newWord,
          score: this.emptyScore,
          status: 'second'
        };

        this.element2.score = next.oldScore.toString();
        this.element2.status = 'first';
        this.element1.status = 'out';
      });
  }

  end(end: EndGame): void {
    this.moving = false;
    this.inAnimation = true;
    rollNumber(end.oldScore, 600, (n) => this.element2.score = n.toString())
      .then(() => {
        /** qui si possono mettere effetti di fine partita, come su mobile */

        this.element1.status = 'dummy';
        this.element2.status = 'dummy';
      });
  }

  onAnimationListDone(event: AnimationEvent): void {
    // console.log('anim end');

    this.moving = false;

    if (event.toState === 'out') {

      this.element1.score = this.element2.score;
      this.element1.word = this.element2.word;
      this.element1.status = 'first';
      this.element2.status = 'second';
      // console.log(this.element2.status);
      this.element2.score = this.emptyScore;
    } else if (event.fromState === 'first' && event.toState === 'second') {
      rollWord(this.newElement.word, 300, w => this.element2.word = w);
      this.inAnimation = false;
    }

    if (event.toState === 'start2') {
      this.inAnimation = false;
    } else if (event.toState === 'dummy') {
      this.inAnimation = false;
    }
  }

  onAnimationStart(event: AnimationEvent): void {
    // console.log('anim start');
    this.inAnimation = true;
  }
}
