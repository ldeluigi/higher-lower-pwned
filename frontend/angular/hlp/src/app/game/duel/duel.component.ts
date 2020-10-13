import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { GameSocketService } from 'src/app/_services/game-socket.service';
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

  constructor(
    private gameSocket: GameSocketService,
  ) { }

  ngOnInit(): void {
    this.subscription = this.gameSocket.game.subscribe(elem => {
      console.log(elem);
    });
  }

  ngOnDestroy(): void {
    this.gameSocket.disconnect();
    this.subscription?.unsubscribe();
    this.subscription = undefined;
  }

  up(): void {
    console.log('up');
    this.gameSocket.answer(1);
  }
  down(): void {
    console.log('down');
    this.gameSocket.answer(2);
  }

  start(): void {
    console.log('start');
    this.gameSocket.startGame().then(() => console.log('done'));
  }
}
