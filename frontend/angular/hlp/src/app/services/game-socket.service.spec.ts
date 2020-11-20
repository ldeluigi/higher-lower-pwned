import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';

import { GameSocketService } from './game-socket.service';

describe('GameSocketService', () => {
  let service: GameSocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        MatSnackBarModule,
        MatDialogModule
      ],
    });
    service = TestBed.inject(GameSocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
