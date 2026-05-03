import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { Role } from './role';

describe('Role', () => {
  let guard: Role;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    });
    guard = TestBed.inject(Role);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
