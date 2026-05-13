import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';

import { OtpVerify } from './otp';
import { AuthService } from '../../../services/authService/authService';

describe('OtpVerify', () => {
  let component: OtpVerify;
  let fixture: ComponentFixture<OtpVerify>;
  let authSpy: any;
  let routerSpy: any;

  beforeEach(async () => {
    authSpy = {
      verifySignup: jasmine.createSpy().and.returnValue(of({})),
      requestSignupOtp: jasmine.createSpy().and.returnValue(of({}))
    };
    const navSpy = { navigate: jasmine.createSpy() };
    const routeStub = { snapshot: { queryParamMap: { get: () => 'test@test.com' } } };

    await TestBed.configureTestingModule({
      imports: [OtpVerify],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: navSpy },
        { provide: ActivatedRoute, useValue: routeStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OtpVerify);
    component = fixture.componentInstance;
    routerSpy = TestBed.inject(Router);
    spyOn(window, 'alert');
    fixture.detectChanges();
  });

  it('should create and load email', () => {
    expect(component).toBeTruthy();
    expect(component.email).toBe('test@test.com');
  });

  it('should not verify invalid otp length', () => {
    component.otp = '123';
    component.verifyOtp();
    expect(component.error).toBe('Please enter a valid 6-digit OTP');
  });

  it('should verify otp and navigate', () => {
    component.otp = '123456';
    component.verifyOtp();
    expect(authSpy.verifySignup).toHaveBeenCalledWith({ email: 'test@test.com', otp: '123456' });
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { verified: 'true' } });
  });

  it('should handle verify error', () => {
    component.otp = '123456';
    authSpy.verifySignup.and.returnValue(throwError(() => ({ error: { message: 'Err' } })));
    component.verifyOtp();
    expect(component.error).toBe('Err');
  });

  it('should resend otp', () => {
    component.resendOtp();
    expect(authSpy.requestSignupOtp).toHaveBeenCalledWith({ email: 'test@test.com', username: '' });
    expect(window.alert).toHaveBeenCalledWith('OTP sent to test@test.com');
  });

  it('should handle resend error', () => {
    authSpy.requestSignupOtp.and.returnValue(throwError(() => ({ error: { message: 'Err' } })));
    component.resendOtp();
    expect(component.error).toBe('Err');
  });
});
