import { Component, OnInit } from '@angular/core';
import { UserDataService } from '../../_services/user-data.service';
import { UserInfo } from 'src/app/_model/userInfo';
import { MatDialog } from '@angular/material/dialog';
import { InputDialogComponent } from 'src/app/_components/input-dialog/input-dialog.component';
import { AccountService } from 'src/app/_services/account.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    private snackBar: MatSnackBar
  ) {
    usersTools.userInfo.subscribe((info) => (this.userInfo = info));
  }

  private log(message: string): void {
    this.snackBar.open(message, 'ok', { duration: 3000 });
  }

  private logUpdated(bool: boolean): void {
    if (bool) {
      this.log('successfully updated');
      this.updateUserInfo();
    } else {
      this.log('an error occurred during the update');
    }
  }

  ngOnInit(): void {
    this.updateUserInfo();
  }

  updateUserInfo(): void {
    this.usersTools.loadUserInfo().subscribe();
  }

  openDialog(paramName: string): void {
    const dialogRef = this.dialog.open(InputDialogComponent, {
      width: '250px',
      data: { paramName, value: '' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (paramName === 'email') {
        this.accountService
          .update(undefined, result)
          .subscribe(this.logUpdated, (_) => this.logUpdated(false));
      } else if (paramName === 'password') {
        this.accountService
          .update(result, undefined)
          .subscribe(this.logUpdated, (_) => this.logUpdated(false));
      }
    });
  }
}
