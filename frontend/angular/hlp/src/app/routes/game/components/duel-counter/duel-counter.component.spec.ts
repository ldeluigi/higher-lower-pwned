import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DuelCounterComponent } from './duel-counter.component';


describe('DuelCounterComponent', () => {
  let component: DuelCounterComponent;
  let fixture: ComponentFixture<DuelCounterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DuelCounterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DuelCounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
