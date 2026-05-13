import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { Auth } from './auth';

describe('AuthGuard', () => {
  let guard: Auth;
  let routerSpy: any;

  beforeEach(() => {
    routerSpy = { navigate: jasmine.createSpy() };
    
    TestBed.configureTestingModule({
      providers: [
        Auth,
        { provide: Router, useValue: routerSpy }
      ]
    });
    
    guard = TestBed.inject(Auth);
  });

  it('should allow if token exists', () => {
    spyOn(sessionStorage, 'getItem').and.returnValue('valid-token');
    expect(guard.canActivate()).toBe(true);
  });

  it('should deny if no token', () => {
    spyOn(sessionStorage, 'getItem').and.returnValue(null);
    expect(guard.canActivate()).toBe(false);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});
