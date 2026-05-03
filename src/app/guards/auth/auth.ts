import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class Auth implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = sessionStorage.getItem('token');
    
    // Robust check for token existence and non-empty/non-null strings
    if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
      return true;
    }

    console.warn('Auth guard: No valid token found, redirecting to login.');
    this.router.navigate(['/login']);
    return false;
  }
}

