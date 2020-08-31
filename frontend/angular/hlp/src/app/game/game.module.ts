import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GameRoutingModule } from './game-routing.module';
import { LayoutComponent } from './layout/layout.component';
import { WordComponent } from './_components/word/word.component';
import { GameComponent } from './game/game.component';


import { MatButtonModule } from '@angular/material/button';


@NgModule({
  declarations: [LayoutComponent, WordComponent, GameComponent],
  imports: [
    CommonModule,
    GameRoutingModule,
    MatButtonModule
  ]
})
export class GameModule { }
