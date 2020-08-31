import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserDataService } from '../../_services/user-data.service';
import { UserInfo } from 'src/app/_model/userInfo';
import { UserStats } from '../../_model/userStats';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { InputDialogComponent } from 'src/app/_components/input-dialog/input-dialog.component';
import { AccountService } from 'src/app/_services/account.service';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.scss']
})
export class UserInfoComponent implements OnInit {

  userInfo: UserInfo = {} as UserInfo;

  constructor(
    private router: Router,
    private usersTools: UserDataService,
    public dialog: MatDialog,
    private accountService: AccountService
  ) {
    usersTools.userInfo.subscribe(info => this.userInfo = info);
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
      data: {paramName, value: ''}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (paramName === 'email') {
        this.accountService.update(undefined, result)
          .subscribe(_ => this.updateUserInfo());
      } else if (paramName === 'password') {
        this.accountService.update(result, undefined)
          .subscribe(_ => this.updateUserInfo());
      }
    });
  }
}
