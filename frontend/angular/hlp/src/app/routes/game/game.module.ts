import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { SocketIoModule } from 'ngx-socket-io';
import { ArcadeComponent } from './arcade/arcade.component';
import { CounterComponent } from './components/counter/counter.component';
import { DuelCounterComponent } from './components/duel-counter/duel-counter.component';
import { PlayerListComponent } from './components/player-list/player-list.component';
import { WordSpinnerComponent } from './components/word-spinner/word-spinner.component';
import { DuelComponent } from './duel/duel.component';
import { GameRoutingModule } from './game-routing.module';
import { LayoutComponent } from './layout/layout.component';
import { RoyaleComponent } from './royale/royale.component';
import { TransitionGroupDirective, TransitionGroupItemDirective } from './components/transition-group/transition-group.component';

@NgModule({
  declarations: [
    LayoutComponent,
    ArcadeComponent,
    CounterComponent,
    WordSpinnerComponent,
    RoyaleComponent,
    PlayerListComponent,
    DuelCounterComponent,
    DuelComponent,
    TransitionGroupItemDirective,
    TransitionGroupDirective
    ],
  imports: [
    CommonModule,
    GameRoutingModule,
    MatButtonModule,
    MatCardModule,
    SocketIoModule,
    MatProgressBarModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule
  ],
  providers: []
})
export class GameModule { }
