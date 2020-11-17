import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { GameStatsService } from './game-stats.service';

describe('StatisticService', () => {
  let service: GameStatsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
      ]
    });
    service = TestBed.inject(GameStatsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
