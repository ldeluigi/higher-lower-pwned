import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { JWTInterceptor } from './jwt.interceptor';

describe('JWTInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      HttpClientTestingModule,
      RouterTestingModule.withRoutes([]),
      MatSnackBarModule
    ],
    providers: [
      JWTInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: JWTInterceptor = TestBed.inject(JWTInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
