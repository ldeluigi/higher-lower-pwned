import { TestBed } from '@angular/core/testing';

import { DuelModeService } from './duel-mode.service';

describe('DuelModeService', () => {
  let service: DuelModeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DuelModeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
