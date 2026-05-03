import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { OtpVerify } from './otp';

describe('OtpVerify', () => {
  let component: OtpVerify;
  let fixture: ComponentFixture<OtpVerify>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtpVerify],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(OtpVerify);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
