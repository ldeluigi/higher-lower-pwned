import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { UserDataService } from '../../_services/user-data.service';
import { UserStats, HistoryItem } from '../../_model/userStats';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { InputDialogComponent } from 'src/app/_components/input-dialog/input-dialog.component';
import { AccountService } from 'src/app/_services/account.service';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-user-stats',
  templateUrl: './user-stats.component.html',
  styleUrls: ['./user-stats.component.scss'],
})
export class UserStatsComponent implements OnInit {
  dataSource = new MatTableDataSource<HistoryItem>([]);
  displayedColumns = [
    'avgScore',
    'avgGuesses',
    'avgPlaysPerDay',
    'avgDuration',
    'maxScore',
    'maxGuesses',
    'maxDuration',
  ];

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  constructor(private usersTools: UserDataService) {
    usersTools.data.subscribe((data) => {
      console.log(data);
      if (data !== undefined) this.dataSource.data = data.history || [];
      console.log(this.dataSource.data);
      console.log(data.history);
    });
  }

  ngOnInit(): void {
    this.dataSource.paginator = this.paginator;
    this.updateUserStats();
  }

  updateUserStats(limit?: number, period?: string): void {
    this.usersTools.loadData(period, limit).subscribe();
  }
}
