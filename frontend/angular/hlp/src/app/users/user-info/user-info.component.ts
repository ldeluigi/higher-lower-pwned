import { Component, OnInit } from '@angular/core';
import { UserDataService } from '../../_services/user-data.service';
import { UserInfo } from 'src/app/_model/userInfo';
import { MatDialog } from '@angular/material/dialog';
import { AccountService } from 'src/app/_services/account.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { DialogData, UpdateComponent } from 'src/app/routes/account/update/update.component';

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

  private log(message: string): void {
    this.snackBar.open(message, 'ok', { duration: 3000 });
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
