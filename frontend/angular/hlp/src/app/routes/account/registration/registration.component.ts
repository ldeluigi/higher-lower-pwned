import { Component, OnInit } from '@angular/core';
import {
  AbstractControl, FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { LogLevel } from 'src/app/model/logLevel';
import { AccountService } from 'src/app/services/account.service';
import { LogService } from 'src/app/services/log.service';
import { UserRegistration } from '../../../model/UserRegistration';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
})
export class RegistrationComponent implements OnInit {
  form: FormGroup;
  returnUrl = '';
  hide = true;
  minUsernameLength = 4;
  maxUsernameLength = 30;
  minPasswordLength = 8;
  usernameError = '';
  passwordError = '';
  emailError = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private logService: LogService,
    private accountService: AccountService,
    private formBuilder: FormBuilder
  ) {
    this.form = this.formBuilder.group({
      username: ['', Validators.compose([
        Validators.required,
        Validators.minLength(this.minUsernameLength),
        Validators.maxLength(this.maxUsernameLength),
        Validators.pattern(RegExp(/^\w+$/))
      ])],
      password: ['', Validators.compose([
        Validators.required,
        Validators.minLength(this.minPasswordLength),
        Validators.pattern(/^[\x00-\x7F]+$/)
      ])],
      email: ['', Validators.compose([
        Validators.required,
        Validators.email
      ])],
    });
  }

  ngOnInit(): void {
    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams.returnUrl || '/';
    this.f.username.setValue(this.route.snapshot.queryParams.username);
  }

  // convenience getter for easy access to form fields
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  onSubmit(): void {
    this.logService.log('Call submit', LogLevel.Info);
    this.usernameError = '';
    this.passwordError = '';
    this.emailError = '';
    if (this.form.invalid) {
      if (this.f.username.invalid) {
        if (this.f.username.errors !== null) {
          if (this.f.username.errors.required) {
            this.usernameError = 'username required';
          } else if (this.f.username.errors.minLength !== null || this.f.username.errors.maxLength !== null) {
            this.usernameError = 'username must be ' + this.minUsernameLength + '-' + this.maxUsernameLength + ' chars';
          } else {
            this.usernameError = 'username must be alpha-numeric';
          }
        } else {
          this.usernameError = 'invalid username';
        }
      }
      if (this.f.password.invalid) {
        if (this.f.password.errors !== null) {
          if (this.f.password.errors.required) {
            this.passwordError = 'password required';
          } else if (this.f.password.errors.minLength !== null) {
            this.passwordError = 'password must be more than ' + this.minPasswordLength + ' chars';
          } else {
            this.passwordError = 'password must be ascii char';
          }
        } else {
          this.passwordError = 'invalid password';
        }
      }
      if (this.f.email.invalid) {
        if (this.f.email.errors !== null) {
          if (this.f.email.errors.required) {
            this.emailError = 'email required';
          } else {
            this.emailError = 'email must be an email address';
          }
        } else {
          this.emailError = 'email';
        }
      }
      return;
    }

    const user: UserRegistration = {
      username: this.f.username.value,
      password: this.f.password.value,
      email: this.f.email.value,
    };
    this.accountService
      .register(user)
      .pipe(first())
      .subscribe(
        (data) => {
          this.logService.messageSnackBar(user.username + 'registered: it\'s time to login and play.');
          this.router.navigate([this.returnUrl]);
        },
        (error) => {
          this.logService.log("registration error:", LogLevel.Debug, error);
          const inputError = error.join(' ,');
          if (inputError.length > 0) {
            this.logService.errorSnackBar(inputError);
          }
        }
      );
  }
}
