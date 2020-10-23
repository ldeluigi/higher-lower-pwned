import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { ErrorInterceptor } from './_helper/error.interceptor';
import { JWTInterceptor } from './_helper/JWT.interceptor';
import { AccountModule } from './account/account.module';
import { UsersModule } from './users/users.module';
import { GameModule } from './game/game.module';

import { LoginButtonComponent } from './_components/login-button/login-button.component';
import { LayoutComponent } from './home/layout/layout.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InputDialogComponent } from './_components/input-dialog/input-dialog.component';

import { LinksComponent } from './home/links/links.component';
import { SharedModule } from './shared/shared.module';
import { StatisticModule } from './statistic/statistic.module';

import { UserHomeComponent } from './home/user-home/user-home.component';
import { NoUserHomeComponent } from './home/no-user-home/no-user-home.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginButtonComponent,
    LayoutComponent,
    InputDialogComponent,
    LinksComponent,
    UserHomeComponent,
    NoUserHomeComponent,
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    AccountModule,
    UsersModule,
    SharedModule,
    GameModule,
    StatisticModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JWTInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
