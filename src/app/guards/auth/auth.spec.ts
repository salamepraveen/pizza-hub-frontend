import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { Auth } from './auth';

describe('Auth', () => {
  let guard: Auth;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    });
    guard = TestBed.inject(Auth);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
