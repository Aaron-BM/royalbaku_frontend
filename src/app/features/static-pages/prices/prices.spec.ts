import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';
import { Prices } from './prices';

describe('Prices', () => {
  let component: Prices;
  let fixture: ComponentFixture<Prices>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Prices],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideTranslateService(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Prices);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
