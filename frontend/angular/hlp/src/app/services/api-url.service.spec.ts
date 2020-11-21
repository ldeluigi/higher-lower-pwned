import { TestBed } from '@angular/core/testing';
import { ApiURLService } from './api-url.service';


describe('ApiURLService', () => {
  let service: ApiURLService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiURLService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
