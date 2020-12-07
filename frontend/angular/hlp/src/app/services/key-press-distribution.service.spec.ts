import { TestBed } from '@angular/core/testing';

import { KeyPressDistributionService } from './key-press-distribution.service';

describe('KeyPressDistributionService', () => {
  let service: KeyPressDistributionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KeyPressDistributionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
