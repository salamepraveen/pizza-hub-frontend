import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';


import { Signup } from './signup';
import { AuthService } from '../../../services/authService/authService';

describe('Signup', () => {
  let component: Signup;
  let fixture: ComponentFixture<Signup>;
  let authServiceSpy: any;
  let routerSpy: any;

  beforeEach(async () => {
    const authSpy = { requestSignupOtp: jasmine.createSpy(), verifySignup: jasmine.createSpy() };
    const rSpy = { navigate: jasmine.createSpy() };

    await TestBed.configureTestingModule({
      imports: [Signup, FormsModule],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: rSpy },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Signup);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService);
    routerSpy = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not send OTP if email is missing', () => {
    component.email = '';
    component.sendOtp();
    expect(component.errorMessage).toBe('Email is required');
  });

  it('should not send OTP if passwords do not match', () => {
    component.email = 'test@test.com';
    component.username = 'test';
    component.password = 'pass1234';
    component.confirmPassword = 'pass';
    component.sendOtp();
    expect(component.errorMessage).toBe('Passwords do not match');
  });

  it('should send OTP successfully and start timer', () => {
    jasmine.clock().install();
    component.email = 'test@test.com';
    component.username = 'test';
    component.password = 'password';
    component.confirmPassword = 'password';
    authServiceSpy.requestSignupOtp.and.returnValue(of({}));

    component.sendOtp();
    jasmine.clock().tick(1);

    expect(component.step).toBe(2);
    expect(component.timer).toBe(60);
    expect(component.successMessage).toBe('OTP sent to test@test.com');
  });

  it('should show error if send OTP fails', () => {
    component.email = 'test@test.com';
    component.username = 'test';
    component.password = 'password';
    component.confirmPassword = 'password';
    authServiceSpy.requestSignupOtp.and.returnValue(throwError(() => ({ error: { message: 'OTP failed' } })));

    component.sendOtp();

    expect(component.errorMessage).toBe('OTP failed');
  });

  it('should verify OTP and navigate to login', () => {
    component.otp = '123456';
    component.email = 'test@test.com';
    authServiceSpy.verifySignup.and.returnValue(of({}));

    component.verifyAndCreate();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { verified: 'true' } });
  });

  it('should show error if OTP is invalid format', () => {
    component.otp = '123';
    component.verifyAndCreate();
    expect(component.errorMessage).toBe('Please enter a valid 6-digit OTP');
  });

  it('should handle verify OTP failure', () => {
    component.otp = '123456';
    component.email = 'test@test.com';
    authServiceSpy.verifySignup.and.returnValue(throwError(() => ({ error: { message: 'Invalid OTP' } })));

    component.verifyAndCreate();

    expect(component.errorMessage).toBe('Invalid OTP');
  });

  it('should resend OTP', () => {
    jasmine.clock().install();
    component.timer = 0;
    component.email = 'test@test.com';
    authServiceSpy.requestSignupOtp.and.returnValue(of({}));

    component.resendOtp();
    jasmine.clock().tick(1);

    expect(component.successMessage).toBe('OTP resent to test@test.com');
  });

  it('should not resend OTP if timer > 0', () => {
    component.timer = 10;
    component.resendOtp();
    expect(authServiceSpy.requestSignupOtp).not.toHaveBeenCalled();
  });

  it('should go back to step 1', () => {
    component.step = 2;
    component.otp = '123';
    component.goBack();
    expect(component.step).toBe(1);
    expect(component.otp).toBe('');
    expect(component.timer).toBe(0);
  });
});
