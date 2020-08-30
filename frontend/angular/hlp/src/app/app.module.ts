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
import {MatButtonToggleModule} from '@angular/material/button-toggle';


@NgModule({
  declarations: [
    AppComponent,
    StatsComponent,
    LoginButtonComponent,
    LayoutComponent,
    LeadeboardComponent,
    PeriodButtonsComponent,
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
    MatButtonToggleModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JWTInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
