import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GameRoutingModule } from './game-routing.module';
import { LayoutComponent } from './layout/layout.component';
import { ArcadeComponent } from './arcade/arcade.component';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { MatButtonModule } from '@angular/material/button';

import { SocketIoModule } from 'ngx-socket-io';
import { CounterComponent } from './_components/counter/counter.component';
import { WordSpinnerComponent } from './_components/word-spinner/word-spinner.component';
import { BattleComponent } from './battle/battle.component';
import { PlayerListComponent } from './_components/player-list/player-list.component';

import { MatIconModule } from '@angular/material/icon';
@NgModule({
  declarations: [
    LayoutComponent,
    ArcadeComponent,
    CounterComponent,
    WordSpinnerComponent,
    BattleComponent,
    PlayerListComponent
    ],
  imports: [
    CommonModule,
    GameRoutingModule,
    MatButtonModule,
    MatCardModule,
    SocketIoModule,
    MatProgressBarModule,
    MatIconModule
  ],
  providers: []
})
export class GameModule { }
