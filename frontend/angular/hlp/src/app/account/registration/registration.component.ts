import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AccountService } from 'src/app/_services/account.service';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { UserRegistration } from '../../_model/UserRegistration';
import { first } from 'rxjs/operators';
@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
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
    private formBuilder: FormBuilder,
  ) {
    this.form = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      email: ['', Validators.email]
    });
  }

  ngOnInit(): void {
    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams.returnUrl || '/';
  }

  // convenience getter for easy access to form fields
  get f(): { [key: string]: AbstractControl; } { return this.form.controls; }

  onSubmit(): void {
    this.error = '';
    if (this.form.invalid) {
      this.error = 'Invalid username, password or email';
      return;
    }

    const user: UserRegistration = {
      username: this.f.username.value,
      password: this.f.password.value,
      email: this.f.email.value
    };
    this.accountService.register(user)
      .pipe(first())
      .subscribe(
        data => {
          this.router.navigate([this.returnUrl]);
        },
        error => {
          this.error = 'Invalid data';
        });
  }
}
