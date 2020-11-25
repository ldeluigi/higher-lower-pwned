import { Component, OnInit } from '@angular/core';
import {
  AbstractControl, FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { AccountService } from 'src/app/services/account.service';
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
    private accountService: AccountService,
    private formBuilder: FormBuilder
  ) {
    this.form = this.formBuilder.group({
      username: ['', Validators.compose([
        Validators.required,
        Validators.minLength(this.minUsernameLength),
        Validators.maxLength(this.maxUsernameLength),
      ])],
      password: ['', Validators.compose([
        Validators.required,
        Validators.minLength(this.minPasswordLength),
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
    this.usernameError = '';
    this.passwordError = '';
    this.emailError = '';
    if (this.form.invalid) {
      if (this.f.username.invalid) {
        if (this.f.username.errors !== null) {
          if (this.f.username.errors.required) {
            this.usernameError = 'username required';
          } else {
            this.usernameError = 'username must be ' + this.minUsernameLength + '-' + this.maxUsernameLength + ' chars';
          }
        } else {
          this.usernameError = 'invalid username';
        }
      }
      if (this.f.password.invalid) {
        if (this.f.password.errors !== null) {
          if (this.f.password.errors.required) {
            this.passwordError = 'password required';
          } else {
            this.passwordError = 'password must be more than ' + this.minPasswordLength + ' chars';
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
          this.router.navigate([this.returnUrl]);
        },
        (error) => {
          const inputError = error.map((elem: { param: string; }) => elem.param).join(' ,');
          if (inputError.length > 0) {
            this.usernameError = 'Invalid ' + inputError + '.';
          }
        }
      );
  }
}
