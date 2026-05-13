import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';


import { Login } from './login';
import { AuthService } from '../../../services/authService/authService';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let authServiceSpy: any;
  let routerSpy: any;

  beforeEach(async () => {
    const authSpy = { login: jasmine.createSpy() };

    await TestBed.configureTestingModule({
      imports: [Login, FormsModule],
      providers: [
        { provide: AuthService, useValue: authSpy },
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService);
    routerSpy = TestBed.inject(Router);
    spyOn(routerSpy, 'navigate');
    fixture.detectChanges();
    sessionStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not login if fields are empty', () => {
    component.email = '';
    component.login();
    expect(component.error).toBe('Please enter email, username, and password');
    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it('should login as PLATFORM_ADMIN and navigate', () => {
    component.email = 'test@test.com';
    component.username = 'test';
    component.password = 'pass';
    const mockResponse = {
      success: true,
      data: { token: 'mockToken', role: 'PLATFORM_ADMIN', username: 'test', userId: 1 }
    };
    authServiceSpy.login.and.returnValue(of(mockResponse));
    spyOn(component as any, 'decodeAndStoreRestaurantId');

    component.login();

    expect(sessionStorage.getItem('token')).toBe('mockToken');
    expect(sessionStorage.getItem('role')).toBe('PLATFORM_ADMIN');
    expect(component.decodeAndStoreRestaurantId).toHaveBeenCalledWith('mockToken');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/platform-admin']);
    expect(component.loading).toBe(false);
  });

  it('should login as ADMIN and navigate', () => {
    component.email = 'admin@test.com';
    component.username = 'admin';
    component.password = 'pass';
    const mockResponse = {
      success: true,
      data: { token: 'mockToken', role: 'ADMIN', username: 'admin', userId: 2 }
    };
    authServiceSpy.login.and.returnValue(of(mockResponse));

    component.login();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin/dashboard']);
  });

  it('should login as STAFF and navigate', () => {
    component.email = 'staff@test.com';
    component.username = 'staff';
    component.password = 'pass';
    const mockResponse = {
      success: true,
      data: { token: 'mockToken', role: 'STAFF', username: 'staff', userId: 3 }
    };
    authServiceSpy.login.and.returnValue(of(mockResponse));

    component.login();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/staff/dashboard']);
  });

  it('should login as CUSTOMER and navigate', () => {
    component.email = 'user@test.com';
    component.username = 'user';
    component.password = 'pass';
    const mockResponse = {
      success: true,
      data: { token: 'mockToken', role: 'USER', username: 'user', userId: 4 }
    };
    authServiceSpy.login.and.returnValue(of(mockResponse));

    component.login();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/customer']);
  });

  it('should show error on login failure', () => {
    component.email = 'test@test.com';
    component.username = 'test';
    component.password = 'pass';
    authServiceSpy.login.and.returnValue(throwError(() => ({ error: { message: 'Invalid credentials' } })));

    component.login();

    expect(component.error).toBe('Invalid credentials');
    expect(component.loading).toBe(false);
  });

  it('should show message if success is false in response', () => {
    component.email = 'test@test.com';
    component.username = 'test';
    component.password = 'pass';
    const mockResponse = { success: false, message: 'Account banned' };
    authServiceSpy.login.and.returnValue(of(mockResponse));

    component.login();

    expect(component.error).toBe('Account banned');
  });

  it('should decode and store restaurant id', () => {
    const header = btoa(JSON.stringify({ alg: 'HS256' }));
    const payload = btoa(JSON.stringify({ assignedRestaurantId: 123 }));
    const token = `${header}.${payload}.signature`;

    component.decodeAndStoreRestaurantId(token);
    expect(sessionStorage.getItem('restaurantId')).toBe('123');
  });

  it('should handle invalid token decode gracefully', () => {
    component.decodeAndStoreRestaurantId('invalid.token');
    expect(sessionStorage.getItem('restaurantId')).toBeNull();
  });
});
