import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AccountService } from '../../../services/account.service';

export interface DialogData {
  passwordUpdate: boolean;
  currentEmail: string | undefined;
}

@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.scss']
})
export class UpdateComponent implements OnInit, OnDestroy {

  private sub: Subscription | undefined;
  formPwd: FormGroup;
  formEmail: FormGroup;
  loadingEmail = false;
  loadingPwd = false;
  submittedEmail = false;
  submittedPwd = false;
  passwordUpdate = false;
  error = '';
  username = 'No userName';
  emailOld = '';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    public dialogRef: MatDialogRef<UpdateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.formPwd = this.formBuilder.group({
      oldPassword: ['', Validators.compose([
        Validators.required,
        Validators.minLength(8),
      ])],
      password: ['', Validators.compose([
        Validators.required,
        Validators.minLength(8),
      ])],
      confirmPassword: ['', Validators.compose([
        Validators.required,
        Validators.minLength(8),
      ])],
    });
    this.formEmail = this.formBuilder.group({
      email: ['', Validators.compose([
        Validators.required,
        Validators.email
      ])],
    });
  }

  ngOnInit(): void {
    this.sub = new Subscription();
    this.sub.add(this.accountService.user.subscribe(user => {
      if (user !== null) {
        this.username = user.username;
      }
    }));

    this.passwordUpdate = this.data.passwordUpdate;
    this.emailOld = this.data.currentEmail || '';
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onEmailSubmit(): void {
    this.submittedEmail = true;

    // reset alerts on submit
    // this.alertService.clear();TODO do an allertService

    // stop here if form is invalid
    if (this.formEmail.invalid) {
      return;
    }

    if (this.formEmail.controls.email.value === this.data.currentEmail) {
      this.error = 'The new password must be different from the old one!';
    }

    this.loadingEmail = true;
    this.accountService.updateEmail(this.formEmail.controls.email.value)
      .then(() => {
          // TODO close
          this.dialogRef.close();
        })
        .catch((error: Error) => {
          this.error = error.message;
          this.loadingEmail = false;
        });
  }

  onPasswordSubmit(): void {
    this.submittedPwd = true;

    // reset alerts on submit
    // this.alertService.clear();TODO do an allertService

    const newPass = this.formPwd.controls.password.value;
    const newPassConfirm = this.formPwd.controls.confirmPassword.value;

    if (newPass !== newPassConfirm) {
      this.error = 'Confirm password is different from new password.';
    }

    // stop here if form is invalid
    if (this.formPwd.invalid) {
      this.error = 'Invalid passwords';
      return;
    }

    this.loadingPwd = true;
    this.accountService.updatePassword(this.formPwd.controls.oldPassword.value, newPass)
      .then(() => {
        this.dialogRef.close();
      })
      .catch((error: Error) => {
        this.error = error.message;
        this.loadingPwd = false;
      });
  }
}
