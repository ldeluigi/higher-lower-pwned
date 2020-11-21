import { NgModule } from '@angular/core';
import { ChartsModule } from 'ng2-charts';
import { SharedModule } from '../../shared/shared.module';
import { LayoutComponent } from './layout/layout.component';
import { UserInfoComponent } from './user-info/user-info.component';
import { UserNavBarComponent } from './user-nav-bar/user-nav-bar.component';
import { UserScoresComponent } from './user-scores/user-scores.component';
import {MatMenuModule} from '@angular/material/menu';
import { UserStatsComponent } from './user-stats/user-stats.component';
import { UsersRoutingModule } from './users-routing.module';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatExpansionModule} from '@angular/material/expansion';


@NgModule({
  declarations: [LayoutComponent, UserInfoComponent, UserStatsComponent, UserNavBarComponent, UserScoresComponent],
  imports: [
    UsersRoutingModule,
    SharedModule,
    ChartsModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatMenuModule,
  ],
  schemas: [],
})
export class UsersModule { }
