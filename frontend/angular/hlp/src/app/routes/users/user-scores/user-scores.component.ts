import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { UserScoresService } from '../../../services/user-scores.service';
import { AccountService } from '../../../services/account.service';
import { Observable, Subscription } from 'rxjs';
import { RequestScore } from 'src/app/model/users/scores/requestScore';
import { CoreUserScores, UserScores } from '../../../model/users/scores/modeScore';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ARCADE, DUEL, ROYALE } from '../../game/model/gameModes';

@Component({
  selector: 'app-user-scores',
  templateUrl: './user-scores.component.html',
  styleUrls: ['./user-scores.component.scss']
})
export class UserScoresComponent implements OnInit, OnDestroy {

  private sub: Subscription | undefined;
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
  total = 0;
  duelString = DUEL;
  arcadeString = ARCADE;
  royaleString = ROYALE;
  selected = this.arcadeString;
  pageSizeOptions: number[] = [10, 20, 50];
  pageSize: number = this.pageSizeOptions[0];
  currentPage = 0;
  sort = false;
  private filter: RequestScore = { // todo
    limit: this.pageSize,
    page: this.currentPage,
    sortbyDate: this.sort // todo
  };

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
    }
  }

  select(mode: string): void {
    const tmp = this.selected;
    if (this.selected !== mode) {
      this.filter.page = 0;
    }
    this.selected = mode;
    switch (mode) {
      case this.arcadeString:
        this.updateData(this.scoreService.getArcadeScores(this.filter));
        break;
      case this.duelString:
        if (this.isDuelLose()) {
          this.updateData(this.scoreService.getDuelLostScores(this.filter));
        } else if (this.isDuelVictory()) {
          this.updateData(this.scoreService.getDuelWinScores(this.filter));
        } else { // default duel selection
          this.updateData(this.scoreService.getDuelScores(this.filter));
        }
        break;
      case this.royaleString:
        if (this.isRoyaleLose()) {
          this.updateData(this.scoreService.getRoyaleLostScores(this.filter));
        } else if (this.royaleSelection === this.victoryRoyaleSelection) {
          this.updateData(this.scoreService.getRoyaleWinScores(this.filter));
        } else { // default royale selection
          this.updateData(this.scoreService.getRoyaleScores(this.filter));
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
      console.log(data);
      this.dataSource.data = data.data;
      this.total = data.meta.total;
      this.pageSize = data.meta.size;
      this.pageSizeOptions = [10, 20, 50];
      this.currentPage = Number(data.meta.page);
    });
  }

  onPaginateChange(pageEvent: PageEvent): void {
    this.filter = {
      limit: pageEvent.pageSize,
      page: pageEvent.pageIndex,
      sortbyDate: this.sort
    };
    this.select(this.selected);
  }

  resort(): void {
    this.filter.sortbyDate = !this.sort;
    this.sort = !this.sort;
    this.select(this.selected);
  }

}
