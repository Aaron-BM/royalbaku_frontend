import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';
import { FloatingContactButtons } from './floating-contact-buttons';

describe('FloatingContactButtons', () => {
  let component: FloatingContactButtons;
  let fixture: ComponentFixture<FloatingContactButtons>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloatingContactButtons],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideTranslateService(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FloatingContactButtons);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
