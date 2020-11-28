import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AccountService } from 'src/app/services/account.service';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { LogService } from '../../../services/log.service';

@Component({
  selector: 'app-delete',
  templateUrl: './delete.component.html',
  styleUrls: ['./delete.component.scss']
})
export class DeleteComponent {

  constructor(
    private accountService: AccountService,
    private router: Router,
    private logService: LogService,
    public dialogRef: MatDialogRef<DeleteComponent>
  ) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  delete(): void {
    const user = this.accountService.userValue?.username || 'user';
    this.accountService
    .deleteUser()
    .pipe(first())
    .subscribe(u => {
      // TODO add some graphic message for the user.
      this.onNoClick();
      this.logService.messageSnackBar('deleted ' + user);
      this.router.navigate(['/home']);
    });
  }

}
