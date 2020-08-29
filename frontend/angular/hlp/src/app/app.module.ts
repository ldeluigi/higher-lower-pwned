import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StatsComponent } from './stats/stats.component';

import { ErrorInterceptor } from './_helper/error.interceptor';
import { JWTInterceptor } from './_helper/JWT.interceptor';
import { AccountModule } from './account/account.module';
import { LoginButtonComponent } from './_components/login-button/login-button.component';
import { LayoutComponent } from './home/layout/layout.component';

@NgModule({
  declarations: [
    AppComponent,
    StatsComponent,
    LoginButtonComponent,
    LayoutComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    AccountModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JWTInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
