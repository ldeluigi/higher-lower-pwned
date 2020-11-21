import { NgModule } from '@angular/core';
// Shared Module
import { SharedModule } from '../../shared/shared.module';
import { AccountRoutingModule } from './account-routing.module';
import { LayoutComponent } from './layout/layout.component';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { UpdateComponent } from './update/update.component';




@NgModule({
  declarations: [
    LoginComponent,
    UpdateComponent,
    RegistrationComponent,
    LayoutComponent,
  ],
  imports: [
    AccountRoutingModule,
    SharedModule
  ]
})
export class AccountModule { }
