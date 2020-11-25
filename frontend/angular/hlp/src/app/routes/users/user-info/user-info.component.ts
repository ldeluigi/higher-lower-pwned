import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { UserInfo } from 'src/app/model/userInfo';
import { DialogData, UpdateComponent } from 'src/app/routes/account/update/update.component';
import { AccountService } from 'src/app/services/account.service';
import { UserDataService } from '../../../services/user-data.service';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.scss'],
})
export class UserInfoComponent implements OnInit {
  userInfo: UserInfo = {} as UserInfo;

  constructor(
    private usersTools: UserDataService,
    public dialog: MatDialog,
    private accountService: AccountService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    usersTools.userInfo.subscribe((info) => (this.userInfo = info));
  }

  ngOnInit(): void {
    this.updateUserInfo();
  }

  updateUserInfo(): void {
    this.usersTools.loadUserInfo().subscribe();
  }

  openDialog(paramName: string): void {
    // TODO refactor this routine, maybe a better form
    const passwordUpdate: boolean = paramName === 'password';
    const options: DialogData = {
      passwordUpdate,
      currentEmail: this.userInfo.email
    };
    this.dialog.open(UpdateComponent, {
      data: options,
    }).afterClosed().pipe(first()).subscribe(e => {
      this.updateUserInfo();
    });

  }

  delete(): void {
    this.accountService
      .deleteUser()
      .pipe(first())
      .subscribe(u => {
        // TODO add some graphic message for the user.
        this.router.navigate(['/home']);
      });
  }
}
