import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BattleComponent } from './battle/battle.component';
import { ArcadeComponent } from './arcade/arcade.component';
import { DuelComponent } from './duel/duel.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'arcade', component: ArcadeComponent
      },
      {
        path: 'duel', component: DuelComponent
      },
      {
        path: 'royale', component: BattleComponent, data: { mode: 'royale' }
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
