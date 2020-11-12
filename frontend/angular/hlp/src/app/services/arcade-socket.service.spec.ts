import { TestBed } from '@angular/core/testing';

import { ArcadeSocketService } from './arcade-socket.service';

describe('GameSocketService', () => {
  let service: ArcadeSocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArcadeSocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
