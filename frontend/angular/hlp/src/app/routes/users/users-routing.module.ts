import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from '../users/layout/layout.component';
import { UserInfoComponent } from './user-info/user-info.component';
import { UserStatsComponent } from './user-stats/user-stats.component';

const routes: Routes = [
  {
    path: '', component: LayoutComponent,
    children: [
      { path: 'info', component: UserInfoComponent },
      { path: 'stats', component: UserStatsComponent },
      { path: 'scores', component: UserStatsComponent },
      { path: '**', redirectTo: 'info' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }
