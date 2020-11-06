import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from '../account/login/login.component';
import { RegistrationComponent } from '../account/registration/registration.component';
import { UpdateComponent } from '../account/update/update.component';
import { LayoutComponent } from '../account/layout/layout.component';
import { AuthGuard } from '../_helper/guards/auth.guard';


const routes: Routes = [
  {
    path: '', component: LayoutComponent,
    children: [
      { path: 'login', component: LoginComponent},
      { path: 'register', component: RegistrationComponent },
      { path: 'update', component: UpdateComponent, canActivate: [AuthGuard] }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountRoutingModule { }
