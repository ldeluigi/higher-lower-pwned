import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccountModule } from './account/account.module';
import { StatsComponent } from './home/stats/stats.component';
import { AuthGuard } from './_helper/auth.guard';
import { LayoutComponent } from './home/layout/layout.component';

const accountModule = () => import('./account/account.module').then(x => x.AccountModule);

const routes: Routes = [
  { path: 'home', component: LayoutComponent },
  { path: 'account', loadChildren: accountModule },
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
