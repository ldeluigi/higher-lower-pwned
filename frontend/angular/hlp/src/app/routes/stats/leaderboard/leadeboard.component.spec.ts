import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LeadeboardComponent } from './leadeboard.component';
import { MatSelectModule } from '@angular/material/select';


describe('LeadeboardComponent', () => {
  let component: LeadeboardComponent;
  let fixture: ComponentFixture<LeadeboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        MatSelectModule,
      ],
      declarations: [ LeadeboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeadeboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
