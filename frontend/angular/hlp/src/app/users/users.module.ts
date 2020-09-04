import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsersRoutingModule } from './users-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { LayoutComponent } from './layout/layout.component';
import { UserInfoComponent } from './user-info/user-info.component';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { UserStatsComponent } from './user-stats/user-stats.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ChartsModule } from 'ng2-charts';
import { SharedModule } from '../shared/shared.module';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';

@NgModule({
  declarations: [LayoutComponent, UserInfoComponent, UserStatsComponent],
  imports: [
    MatCardModule,
    CommonModule,
    ReactiveFormsModule,
    UsersRoutingModule,
    MatInputModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    SharedModule,
    ChartsModule,
    MatSnackBarModule,
    MatExpansionModule,
  ],
  schemas: [],
})
export class UsersModule {}
