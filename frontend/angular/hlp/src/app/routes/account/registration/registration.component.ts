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
  error = '';
  returnUrl = '';
  hide = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private formBuilder: FormBuilder
  ) {
    this.form = this.formBuilder.group({
      username: ['', Validators.compose([
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(30),
      ])],
      password: ['', Validators.compose([
        Validators.required,
        Validators.minLength(8),
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
    this.error = '';
    const errors: string[] = [];
    if (this.form.invalid) {
      if (this.f.username.invalid) {
        errors.push('username');
      }
      if (this.f.password.invalid) {
        errors.push('password');
      }
      if (this.f.email.invalid) {
        errors.push('email');
      }
      if (errors.length > 0) {
        this.error = 'Invalid ' + errors.join(', ') + '.';
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
            this.error = 'Invalid ' + inputError + '.';
          }
          this.error = error.join(' ,');
          }
      );
  }
}
