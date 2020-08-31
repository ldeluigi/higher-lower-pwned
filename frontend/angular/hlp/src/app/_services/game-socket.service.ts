import { Injectable } from '@angular/core';
import * as io from 'ngx-socket-io';
import { Error } from '../game/_model/error';
import { GameEnd } from '../game/_model/gameEnd';
import { NextGuess } from '../game/_model/nextGuess';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GameSocketService {
  public game: Observable<GameEnd | NextGuess>;

  constructor(private socket: io.Socket) {
    this.game = new Observable<GameEnd | NextGuess>((s) => {
      this.socket.on('guess', (nextGuess: NextGuess) => s.next(nextGuess));
      this.socket.on('onerror', (err: Error) => s.error(err));
      this.socket.on('gameEnd', (gameEnd: GameEnd) => s.next(gameEnd));
    });
  }

  startGame() {
    this.socket.connect();
    this.socket.emit('start');
  }

  getUser(id: string) {
    this.socket.emit('io.connection', id);
  }

  repeat() {
    this.socket.emit('repeat');
  }

  answer(answer: number) {
    this.socket.emit('answer', answer);
  }

  disconnect() {
    this.socket.disconnect();
  }
}
