import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WordSpinnerComponent } from './word-spinner.component';

describe('WordSpinnerComponent', () => {
  let component: WordSpinnerComponent;
  let fixture: ComponentFixture<WordSpinnerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WordSpinnerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WordSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
