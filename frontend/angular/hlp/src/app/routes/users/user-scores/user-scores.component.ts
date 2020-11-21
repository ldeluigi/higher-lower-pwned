import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { UserScoresService } from '../../../services/user-scores.service';
import { AccountService } from '../../../services/account.service';
import { Observable, Subscription } from 'rxjs';
import { RequestScore } from 'src/app/model/users/scores/requestScore';
import { CoreUserScores, UserScores } from '../../../model/users/scores/modeScore';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-user-scores',
  templateUrl: './user-scores.component.html',
  styleUrls: ['./user-scores.component.scss']
})
export class UserScoresComponent implements OnInit, OnDestroy {

  private sub: Subscription | undefined;
  private haveToBeDeleted: RequestScore | undefined /* = { //todo
    limit: 5,
    page: 0,
    sortbyDate: true
  };*/
  private defaultDuelSelection = 'global';
  private victoryDuelSelection = 'victory';
  private loseDuelSelection = 'lose';
  private duelSelection = this.defaultDuelSelection;

  private defaultRoyaleSelection = 'global';
  private victoryRoyaleSelection = 'victory';
  private loseRoyaleSelection = 'lose';
  private royaleSelection = this.defaultRoyaleSelection;

  private defaultColumns = [
    'score',
    'guesses',
    'date',
    'duration',
  ];

  displayedColumns = this.defaultColumns;
  dataSource = new MatTableDataSource<CoreUserScores>([]);
  @ViewChild(MatPaginator, {static: true}) paginator!: MatPaginator;
  duelString = 'duel';
  arcadeString = 'arcade';
  royaleString = 'royale';
  selected = this.arcadeString;

  constructor(
    private router: Router,
    private accountService: AccountService,
    private scoreService: UserScoresService
  ) {
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  ngOnInit(): void {
    if (this.accountService.userValue === null) {
      this.router.navigate(['/login']);
    } else {
      this.select(this.selected);
      this.dataSource.paginator = this.paginator;
    }
  }

  select(mode: string): void {
    const tmp = this.selected;
    this.selected = mode;
    switch (mode) {
      case this.arcadeString:
        this.updateData(this.scoreService.getArcadeScores(this.haveToBeDeleted));
        break;
      case this.duelString:
        if (this.isDuelLose()) {
          this.updateData(this.scoreService.getDuelLostScores(this.haveToBeDeleted));
        } else if (this.isDuelVictory()) {
          this.updateData(this.scoreService.getDuelWinScores(this.haveToBeDeleted));
        } else { // default duel selection
          this.updateData(this.scoreService.getDuelScores(this.haveToBeDeleted));
        }
        break;
      case this.royaleString:
        if (this.isRoyaleLose()) {
          this.updateData(this.scoreService.getRoyaleLostScores(this.haveToBeDeleted));
        } else if (this.royaleSelection === this.victoryRoyaleSelection) {
          this.updateData(this.scoreService.getRoyaleWinScores(this.haveToBeDeleted));
        } else { // default royale selection
          this.updateData(this.scoreService.getRoyaleScores(this.haveToBeDeleted));
        }
        break;
      default:
        this.selected = tmp;
        throw new Error('unknown mode');
    }
  }

  duelScopeSelection(scope: string): void {
    this.duelSelection = scope;
    this.select(this.duelString);
  }

  isDuelVictory(): boolean {
    return this.duelSelection === this.victoryDuelSelection;
  }

  isDuelLose(): boolean {
    return this.duelSelection === this.loseDuelSelection;
  }

  isRoyaleVictory(): boolean {
    return this.royaleSelection === this.victoryRoyaleSelection;
  }

  isRoyaleLose(): boolean {
    return this.royaleSelection === this.loseRoyaleSelection;
  }

  royaleScopeSelection(scope: string): void {
    this.royaleSelection = scope;
    this.select(this.royaleString);
  }

  isSelected(mode: string): boolean {
    return mode === this.selected;
  }

  private updateData(obs: Observable<UserScores>): void {
    this.sub = obs.subscribe((data) => {
      this.dataSource.data = data.data;
    });
  }
}
