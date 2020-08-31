import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StatsComponent } from './home/stats/stats.component';

import { ErrorInterceptor } from './_helper/error.interceptor';
import { JWTInterceptor } from './_helper/JWT.interceptor';
import { AccountModule } from './account/account.module';
import { UsersModule } from './users/users.module';
import { LoginButtonComponent } from './_components/login-button/login-button.component';
import { LayoutComponent } from './home/layout/layout.component';
import { LeadeboardComponent } from './home/leaderboard/leadeboard.component';
import { PeriodButtonsComponent } from './_components/period-buttons/period-buttons.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { InputDialogComponent } from './_components/input-dialog/input-dialog.component';
import { MatTableModule } from '@angular/material/table';
import {MatExpansionModule} from '@angular/material/expansion';
import { MatPaginatorModule } from '@angular/material/paginator';

@NgModule({
  declarations: [
    AppComponent,
    StatsComponent,
    LoginButtonComponent,
    LayoutComponent,
    LeadeboardComponent,
    PeriodButtonsComponent,
    InputDialogComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    AccountModule,
    UsersModule,
    BrowserAnimationsModule,
    MatButtonToggleModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatTableModule,
    MatPaginatorModule,
    MatExpansionModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JWTInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
