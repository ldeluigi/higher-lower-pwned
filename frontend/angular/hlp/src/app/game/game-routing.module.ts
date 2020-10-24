import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DuelComponent } from './duel/duel.component';
import { GameComponent } from './game/game.component';
import { LayoutComponent } from './layout/layout.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'arcade', component: GameComponent
      },
      {
        path: 'duel', component: DuelComponent
      },
      {
        path: '**', redirectTo: '/game/arcade', pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GameRoutingModule { }
