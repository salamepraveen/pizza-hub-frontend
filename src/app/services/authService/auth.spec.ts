import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { AuthService } from './authService';

describe('AuthService', () => {
  let service: AuthService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call login and return data', () => {
    const mockCredentials = { email: 'test@test.com', username: 'testuser', password: 'password' };
    const mockResponse = { token: 'mock-token' };

    service.login(mockCredentials).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpTestingController.expectOne('/auth/signin');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockCredentials);
    req.flush(mockResponse);
  });

  it('should call signup and return data', () => {
    const mockData = { email: 'test@test.com', username: 'testuser', password: 'password' };
    const mockResponse = { message: 'Signup successful' };

    service.signup(mockData).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpTestingController.expectOne('/auth/signup/direct');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockData);
    req.flush(mockResponse);
  });

  it('should call requestSignupOtp and return data', () => {
    const mockData = { email: 'test@test.com', username: 'testuser' };
    const mockResponse = { message: 'OTP sent' };

    service.requestSignupOtp(mockData).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpTestingController.expectOne('/auth/signup/request');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockData);
    req.flush(mockResponse);
  });

  it('should call verifySignup and return data', () => {
    const mockData = { email: 'test@test.com', otp: '123456' };
    const mockResponse = { message: 'Verification successful' };

    service.verifySignup(mockData).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpTestingController.expectOne('/auth/signup/verify');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockData);
    req.flush(mockResponse);
  });
});
