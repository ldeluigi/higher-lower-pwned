import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../_services/account.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  form: FormGroup = {} as FormGroup;
  loading = false;
  submitted = false;
  returnUrl = '';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService
  ) { }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams.returnUrl || '/';
  }

  // convenience getter for easy access to form fields
  // tslint:disable-next-line: typedef
  get f() { return this.form.controls; }

  onSubmit(): void {
    this.submitted = true;

    // reset alerts on submit
    // this.alertService.clear();TODO do an allertService

    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    this.accountService.login(this.f.username.value, this.f.password.value)
      .pipe(first())
      .subscribe(
        data => {
          this.router.navigate(['update']);
        },
        error => {
          // this.alertService.error(error); TODO do an allertService
          this.loading = false;
        });
  }

  reset(): void {
    this.accountService.logout();
  }
}
