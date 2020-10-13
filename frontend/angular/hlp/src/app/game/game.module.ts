import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GameRoutingModule } from './game-routing.module';
import { LayoutComponent } from './layout/layout.component';
import { WordComponent } from './_components/word/word.component';
import { GameComponent } from './game/game.component';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { MatButtonModule } from '@angular/material/button';

import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { CounterComponent } from './_components/counter/counter.component';
import { WordSpinnerComponent } from './word-spinner/word-spinner.component';
import { DuelComponent } from './duel/duel.component';
import { SocketArcade } from './SocketArcade';
import { SocketDuel } from './SocketDuel';

@NgModule({
  declarations: [LayoutComponent, WordComponent, GameComponent, CounterComponent, WordSpinnerComponent, DuelComponent],
  imports: [
    CommonModule,
    GameRoutingModule,
    MatButtonModule,
    MatCardModule,
    SocketIoModule,
    MatProgressBarModule
  ],
  providers: [SocketArcade, SocketDuel]
})
export class GameModule { }
