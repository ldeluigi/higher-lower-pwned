import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';

import { UserScoresService } from './user-scores.service';

describe('UserScoresService', () => {
  let service: UserScoresService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([]),
        MatSnackBarModule
      ]
    });
    service = TestBed.inject(UserScoresService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // it('#makeScoreRequest should return value from observable',
  // (done: DoneFn) => {
  //   service.getArcadeScores().subscribe(value => {
  //     expect(value).toBe(UserScore);
  //     done();
  //   });
  // });
});
