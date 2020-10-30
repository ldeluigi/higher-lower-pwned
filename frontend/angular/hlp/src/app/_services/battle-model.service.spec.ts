import { TestBed } from '@angular/core/testing';

import { BattleModelService } from './battle-model.service';

describe('BattleModelService', () => {
  let service: BattleModelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BattleModelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
