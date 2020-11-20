import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RoyaleComponent } from './royale/royale.component';
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
        path: 'royale', component: RoyaleComponent
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
