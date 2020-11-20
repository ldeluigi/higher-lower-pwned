import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './helper/guards/auth.guard';
import { LayoutComponent } from './layout/layout.component';
import { HomePageComponent } from './routes/home/home-page/home-page.component';

const accountModule = () => import('./routes/account/account.module').then(x => x.AccountModule);
const usersModule = () => import('./routes/users/users.module').then(x => x.UsersModule);
const gameModule = () => import('./routes/game/game.module').then(x => x.GameModule);
const statsModule = () => import('./routes/stats/stats.module').then(x => x.StatsModule);
const infoModule = () => import('./routes/info/info.module').then(m => m.InfoModule);

const routes: Routes = [
  {
    path: '', component: LayoutComponent,
    children: [
      { path: 'home', component: HomePageComponent },
      { path: 'account', loadChildren: accountModule },
      { path: 'users', loadChildren: usersModule, canActivate: [AuthGuard] },
      { path: 'game', loadChildren: gameModule },
      { path: 'stats', loadChildren: statsModule },
      { path: 'info', loadChildren: infoModule },
      { path: '**', redirectTo: 'home' }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
