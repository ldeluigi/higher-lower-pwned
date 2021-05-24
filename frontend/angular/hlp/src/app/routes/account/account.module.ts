import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { AccountRoutingModule } from './account-routing.module';
import { LayoutComponent } from './layout/layout.component';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { UpdateComponent } from './update/update.component';
import { DeleteComponent } from './delete/delete.component';

@NgModule({
  declarations: [
    LoginComponent,
    UpdateComponent,
    RegistrationComponent,
    LayoutComponent,
    DeleteComponent,
  ],
  imports: [
    AccountRoutingModule,
    SharedModule
  ]
})
export class AccountModule { }
