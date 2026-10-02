import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';
import { CarDetail } from './car-detail';

describe('CarDetail', () => {
  let component: CarDetail;
  let fixture: ComponentFixture<CarDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarDetail],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideTranslateService(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CarDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
