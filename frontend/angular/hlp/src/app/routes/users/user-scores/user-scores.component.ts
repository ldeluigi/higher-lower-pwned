import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CoreUserScores, UserScores } from 'src/app/model/users/scores/modeScore';
import { RequestScore } from 'src/app/model/users/scores/requestScore';
import { AccountService } from '../../../services/account.service';
import { UserScoresService } from "../../../services/user-scores.service";

@Component({
  selector: 'app-user-scores',
  templateUrl: './user-scores.component.html',
  styleUrls: ['./user-scores.component.scss']
})
export class UserScoresComponent implements OnInit, OnDestroy {

  private sub: Subscription | undefined;
  private haveToBeDeleted: RequestScore | undefined = {limit: 5,
    page: 0,
    sortbyDate: true}

  private cs: CoreUserScores | undefined;
  private s: UserScores | undefined;

  private defaultColumns = [
    'score',
    'guesses',
    'date',
    'duration',
  ];

  displayedColumns = this.defaultColumns;
  dataSource = new MatTableDataSource<CoreUserScores>([]);
  

  constructor(
    private router: Router,
    private accountService: AccountService,
    private scoreService:UserScoresService) { }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  ngOnInit(): void {
    if (this.accountService.userValue === null) {
      this.router.navigate(['/login']);
    } else {
      this.sub = this.scoreService.getArcadeScores(this.haveToBeDeleted).subscribe((data) => {
        this.dataSource.data = data.data; 
      });
      this.sub = this.scoreService.getDuelScores(this.haveToBeDeleted).subscribe((data) => {
        this.dataSource.data = data.data; 
      });
    }
  }
}
