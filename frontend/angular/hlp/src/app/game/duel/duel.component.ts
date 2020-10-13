import { ViewChild } from '@angular/core';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DuelModeService } from 'src/app/_services/duel-mode.service';
import { WordSpinnerComponent } from '../word-spinner/word-spinner.component';
import { CardData } from '../_components/word/word.component';

@Component({
  selector: 'app-duel',
  templateUrl: './duel.component.html',
  styleUrls: ['./duel.component.scss']
})
export class DuelComponent implements OnInit, OnDestroy {

  card: CardData = { word: '', score: 0 };
  card2: CardData = { word: '' };
  subscription: Subscription | undefined;

  actualScore = 0;

  @ViewChild(WordSpinnerComponent)
  private wordAnimation!: WordSpinnerComponent;

  constructor(
    private gameSocket: DuelModeService,
  ) { }

  ngOnInit(): void {
    this.subscription = this.gameSocket.game.subscribe(elem => {
      console.log(elem);
      this.wordAnimation.next({oldScore: elem.value1, newWord: elem.password2 });
      this.actualScore = elem.score ? elem.score : 0;
    });
  }

  ngOnDestroy(): void {
    this.gameSocket.disconnect();
    this.subscription?.unsubscribe();
    this.subscription = undefined;
  }

  up(): void {
    this.gameSocket.answer(1);
  }

  down(): void {
    this.gameSocket.answer(2);
  }

  start(): void {
    this.gameSocket.startGame().then(() => console.log('done'));
  }

  repete(): void {
    this.gameSocket.repeat();
  }
}
