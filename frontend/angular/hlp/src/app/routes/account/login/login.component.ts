import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { AccountService } from '../../../services/account.service';
import { LogService } from '../../../services/log.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  loading = false;
  submitted = false;
  returnUrl = '';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private logService: LogService,
    private accountService: AccountService
  ) {
    this.form = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams.returnUrl || '/';
  }

  registration(): void {
    this.router.navigate(['/account/register'], { queryParams: { returnUrl: `${this.returnUrl}`, username: `${this.f.username.value}` }});
  }

  // convenience getter for easy access to form fields
  // tslint:disable-next-line: typedef
  get f() {
    return this.form.controls;
  }

  onSubmit(): void {

    // stop here if form is invalid
    if (this.form.invalid) {
      const errors: string[] = [];
      if (this.f.username.invalid) {
        errors.push('username');
      }
      if (this.f.password.invalid) {
        errors.push('password');
      }
      if (errors.length > 0) {
        this.logService.errorSnackBar('Missing ' + errors.join(' and ') + '.');
      }
      return;
    }

    this.accountService
      .login(this.f.username.value, this.f.password.value)
      .pipe(first())
      .subscribe(
        (data) => {
          this.router.navigate([this.returnUrl]);
        },
        (error) => {
          // console.log(error);
          this.logService.errorSnackBar('Wrong Username or Password');
        },
      );
  }
}
