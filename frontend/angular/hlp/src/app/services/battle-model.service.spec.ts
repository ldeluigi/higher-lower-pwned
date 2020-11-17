import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';

import { BattleModelService } from './battle-model.service';

describe('BattleModelService', () => {
  let service: BattleModelService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        MatSnackBarModule,
        MatDialogModule
      ],
    });
    service = TestBed.inject(BattleModelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
