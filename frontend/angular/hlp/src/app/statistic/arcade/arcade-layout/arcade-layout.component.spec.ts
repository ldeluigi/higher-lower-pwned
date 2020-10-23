import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArcadeLayoutComponent } from './arcade-layout.component';

describe('ArcadeLayoutComponent', () => {
  let component: ArcadeLayoutComponent;
  let fixture: ComponentFixture<ArcadeLayoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArcadeLayoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArcadeLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
