import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { UserScoresService } from "../../../services/user-scores.service";
import { AccountService } from '../../../services/account.service';
import { Observable, Subscription } from 'rxjs';
import { RequestScore } from 'src/app/model/users/scores/requestScore';
import { CoreUserScores, UserScores } from '../../../model/users/scores/modeScore';

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
  selected = "arcade";
  

  constructor(
    private router: Router,
    private accountService: AccountService,
    private scoreService:UserScoresService
  ) { }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  ngOnInit(): void {
    if (this.accountService.userValue === null) {
      this.router.navigate(['/login']);
    } else {
      this.select(this.selected);
    }
  }

  select(mode: string) {
    const tmp = this.selected;
    this.selected = mode;
    switch (mode) {
      case 'arcade':
        this.updateData(this.scoreService.getArcadeScores(this.haveToBeDeleted));
        break;
      case 'duel':
        this.updateData(this.scoreService.getDuelScores(this.haveToBeDeleted));
        break;
      case 'duelWin':
        this.updateData(this.scoreService.getDuelScores(this.haveToBeDeleted));
        break;
      case 'royale':
        this.updateData(this.scoreService.getRoyaleScores(this.haveToBeDeleted));
        break;
      case 'royaleWin':
        this.updateData(this.scoreService.getRoyaleScores(this.haveToBeDeleted));
        break;
      default:
        this.selected = tmp;
        throw new Error("unknown mode");
    }
  }

  isSelected(mode: string) {
    return mode === this.selected;
  }

  private updateData( obs: Observable<UserScores>) {
    this.sub = obs.subscribe((data) => {
      this.dataSource.data = data.data; 
    });
  }
}
