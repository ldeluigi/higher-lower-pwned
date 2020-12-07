import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { ArcadeComponent } from './arcade/arcade.component';
import { DuelComponent } from './duel/duel.component';
import { RoyaleComponent } from './royale/royale.component';

const routes: Routes = [
  {
    path: '', component: LayoutComponent,
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
