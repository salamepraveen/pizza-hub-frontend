import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot } from '@angular/router';

import { Role } from './role';

describe('RoleGuard', () => {
  let guard: Role;
  let routerSpy: any;

  beforeEach(() => {
    routerSpy = { navigate: jasmine.createSpy() };
    
    TestBed.configureTestingModule({
      providers: [
        Role,
        { provide: Router, useValue: routerSpy }
      ]
    });
    
    guard = TestBed.inject(Role);
  });

  it('should allow if user has expected role', () => {
    spyOn(sessionStorage, 'getItem').and.returnValue('USER');
    const route = { data: { expectedRoles: ['USER'] } } as unknown as ActivatedRouteSnapshot;
    expect(guard.canActivate(route)).toBe(true);
  });

  it('should allow PLATFORM_ADMIN everywhere', () => {
    spyOn(sessionStorage, 'getItem').and.returnValue('PLATFORM_ADMIN');
    const route = { data: { expectedRoles: ['USER'] } } as unknown as ActivatedRouteSnapshot;
    expect(guard.canActivate(route)).toBe(true);
  });

  it('should allow ADMIN for most roles', () => {
    spyOn(sessionStorage, 'getItem').and.returnValue('ADMIN');
    const route = { data: { expectedRoles: ['USER'] } } as unknown as ActivatedRouteSnapshot;
    expect(guard.canActivate(route)).toBe(true);
  });

  it('should deny ADMIN from PLATFORM_ADMIN routes', () => {
    spyOn(sessionStorage, 'getItem').and.returnValue('ADMIN');
    const route = { data: { expectedRoles: ['PLATFORM_ADMIN'] } } as unknown as ActivatedRouteSnapshot;
    expect(guard.canActivate(route)).toBe(false);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should deny if no role', () => {
    spyOn(sessionStorage, 'getItem').and.returnValue(null);
    const route = { data: { expectedRoles: ['USER'] } } as unknown as ActivatedRouteSnapshot;
    expect(guard.canActivate(route)).toBe(false);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});
