import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserScoresService } from "../../../services/user-scores.service";
import { Subscription } from 'rxjs';
import { RequestScore } from 'src/app/model/users/scores/requestScore';
import { MatTableDataSource } from '@angular/material/table';
import { UserScores, CoreUserScores } from 'src/app/model/users/scores/modeScore';

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
  

  constructor(private scoreService:UserScoresService) { }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  ngOnInit(): void {
    this.sub = this.scoreService.getArcadeScores(this.haveToBeDeleted).subscribe((data) => {
      console.log(data.data)
      this.dataSource.data = data.data; 
    })
  }
}
