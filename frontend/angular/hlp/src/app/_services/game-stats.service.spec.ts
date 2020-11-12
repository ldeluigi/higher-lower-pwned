import { TestBed } from '@angular/core/testing';

import { GameStatsService } from './routes/game-stats.service';

describe('StatisticService', () => {
  let service: GameStatsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameStatsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
