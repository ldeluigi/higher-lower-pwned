import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../_services/account.service';
import { first } from 'rxjs/operators';
import { User } from 'src/app/_model/user';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.scss']
})
export class UpdateComponent implements OnInit {

  formPwd: FormGroup;
  formEmail: FormGroup;
  loadingEmail = false;
  loadingPwd = false;
  submittedEmail = false;
  submittedPwd = false;
  returnUrl = '';
  username = 'No userName';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService
  ) {
    this.formPwd = this.formBuilder.group({
      password: ['', Validators.required],
    });
    this.formEmail = this.formBuilder.group({
      email: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.accountService.user.subscribe(user => {
      if (user !== null) {
        this.username = user.username;
      }
    });
    this.returnUrl = this.route.snapshot.queryParams.returnUrl || '/';
  }

  onEmailSubmit(): void {
    this.submittedEmail = true;

    // reset alerts on submit
    // this.alertService.clear();TODO do an allertService

    // stop here if form is invalid
    if (this.formEmail.invalid) {
      return;
    }

    this.loadingEmail = true;
    this.accountService.update(undefined, this.formEmail.controls.email.value)
      .pipe(first())
      .subscribe(
        data => {
          this.router.navigate([this.returnUrl]);
        },
        error => {
          // this.alertService.error(error); TODO do an allertService
          this.loadingEmail = false;
        });
  }

  onPasswordSubmit(): void {
    this.submittedPwd = true;

    // reset alerts on submit
    // this.alertService.clear();TODO do an allertService

    // stop here if form is invalid
    if (this.formPwd.invalid) {
      return;
    }

    this.loadingPwd = true;
    this.accountService.update(this.formPwd.controls.password.value, undefined)
      .pipe(first())
      .subscribe(
        data => {
          this.router.navigate([this.returnUrl]);
        },
        error => {
          // this.alertService.error(error); TODO do an allertService
          this.loadingPwd = false;
        });
  }
}
