import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GameRoutingModule } from './game-routing.module';
import { LayoutComponent } from './layout/layout.component';
import { WordComponent } from './_components/word/word.component';
import { GameComponent } from './game/game.component';
import { MatCardModule } from '@angular/material/card';
import {MatProgressBarModule} from '@angular/material/progress-bar';


import { MatButtonModule } from '@angular/material/button';

import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { environment } from 'src/environments/environment';

const config: SocketIoConfig = { url: `${environment.apiUrl}/arcade`, options: { autoConnect : false }};

@NgModule({
  declarations: [LayoutComponent, WordComponent, GameComponent],
  imports: [
    CommonModule,
    GameRoutingModule,
    MatButtonModule,
    MatCardModule,
    SocketIoModule.forRoot(config),
    MatProgressBarModule
  ]
})
export class GameModule { }
