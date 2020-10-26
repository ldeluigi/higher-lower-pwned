import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DuelComponent } from './duel/duel.component';
import { ArcadeComponent } from './arcade/arcade.component';
import { LayoutComponent } from './layout/layout.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'arcade', component: ArcadeComponent
      },
      {
        path: 'duel', component: DuelComponent, data: { mode: 'duel' }
      },
      {
        path: 'royale', component: DuelComponent, data: { mode: 'royale' }
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
