import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { LeadeboardComponent } from './leaderboard/leadeboard.component';
import { StatsComponent } from './stats/stats.component';
import { ViewSelectorComponent } from './view-selector/view-selector.component';

const routes: Routes = [
  {
    path: '', component: LayoutComponent,
    children: [
      {
        path: 'statistics', component: ViewSelectorComponent, data: { mode: 'statistics' },
        children: [
          { path: 'global', component: StatsComponent, data: { mode: '' } },
          { path: 'arcade', component: StatsComponent, data: { mode: 'arcade' } },
          { path: 'duel', component: StatsComponent, data: { mode: 'duel' } },
          { path: 'royale', component: StatsComponent, data: { mode: 'royale' } },
          { path: '**', redirectTo: 'arcade' }
        ]
      },
      {
        path: 'leaderboard', component: ViewSelectorComponent, data: { mode: 'leaderboard' },
        children: [
          { path: 'arcade', component: LeadeboardComponent, data: { mode: 'arcade' } },
          { path: 'duel', component: LeadeboardComponent, data: { mode: 'duel' } },
          { path: 'royale', component: LeadeboardComponent, data: { mode: 'royale' } },
          { path: '**', redirectTo: 'arcade' }
        ]
      },
      {
        path: '**', redirectTo: '/stats/leaderboard/arcade', pathMatch: 'full'
      }
    ],
  },
  { path: '**', redirectTo: 'global' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StatisticRoutingModule { }
