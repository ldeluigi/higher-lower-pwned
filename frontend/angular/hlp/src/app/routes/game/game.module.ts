import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GameRoutingModule } from './game-routing.module';
import { LayoutComponent } from './layout/layout.component';
import { ArcadeComponent } from './arcade/arcade.component';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { MatButtonModule } from '@angular/material/button';

import { SocketIoModule } from 'ngx-socket-io';
import { CounterComponent } from './components/counter/counter.component';
import { WordSpinnerComponent } from './components/word-spinner/word-spinner.component';
import { BattleComponent } from './battle/battle.component';
import { PlayerListComponent } from './components/player-list/player-list.component';

import { MatIconModule } from '@angular/material/icon';
import { DuelCounterComponent } from './components/duel-counter/duel-counter.component';
import { DuelComponent } from './duel/duel.component';
import { MatTableModule } from '@angular/material/table';

@NgModule({
  declarations: [
    LayoutComponent,
    ArcadeComponent,
    CounterComponent,
    WordSpinnerComponent,
    BattleComponent,
    PlayerListComponent,
    DuelCounterComponent,
    DuelComponent
    ],
  imports: [
    CommonModule,
    GameRoutingModule,
    MatButtonModule,
    MatCardModule,
    SocketIoModule,
    MatProgressBarModule,
    MatIconModule,
    MatTableModule
  ],
  providers: []
})
export class GameModule { }
