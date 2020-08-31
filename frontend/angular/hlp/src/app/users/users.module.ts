import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsersRoutingModule } from './users-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { LayoutComponent } from './layout/layout.component';
import { UserInfoComponent } from './user-info/user-info.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [LayoutComponent, UserInfoComponent],
  imports: [
    MatCardModule,
    CommonModule,
    ReactiveFormsModule,
    UsersRoutingModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
  ]
})
export class UsersModule { }
