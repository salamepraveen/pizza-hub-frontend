import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class Role implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRoles = route.data['expectedRoles'] as Array<string>;
    let userRole = sessionStorage.getItem('role');

    if (!userRole || userRole === 'null' || userRole === 'undefined') {
      console.warn('Role guard: No role found in session, redirecting to login.');
      this.router.navigate(['/login']);
      return false;
    }

    // Normalize role: convert to uppercase and remove ROLE_ prefix if present
    const normalizedUserRole = userRole.toUpperCase().startsWith('ROLE_') 
      ? userRole.toUpperCase().substring(5) 
      : userRole.toUpperCase();

    const normalizedExpectedRoles = expectedRoles.map(r => r.toUpperCase());

    if (normalizedExpectedRoles.includes(normalizedUserRole)) {
      return true;
    }

    // Platform Admin fallback - they can access everything
    if (normalizedUserRole === 'PLATFORM_ADMIN') {
      return true;
    }

    // Admin fallback - but NOT for PLATFORM_ADMIN routes
    if (normalizedUserRole === 'ADMIN' && !normalizedExpectedRoles.includes('PLATFORM_ADMIN')) {
      return true;
    }

    console.warn(`Role guard: Role ${userRole} (normalized: ${normalizedUserRole}) not in expected ${normalizedExpectedRoles}. Redirecting.`);
    this.router.navigate(['/login']);
    return false;
  }
}

