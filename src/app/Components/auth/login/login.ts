import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/authService/authService';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterModule],
  templateUrl: './login.html',
  styleUrls:['./login.css']
})
export class Login {
  email = '';
  username = '';
  password = '';
  loading = false;
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login() {
    if (!this.email || !this.username || !this.password) {
      this.error = 'Please enter email, username, and password';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login({ email: this.email, username: this.username, password: this.password }).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res.success && res.data) {
          const token = res.data.token;
          sessionStorage.setItem('token', token);
          sessionStorage.setItem('role', res.data.role);
          sessionStorage.setItem('username', res.data.username);
          sessionStorage.setItem('email', this.email);
          sessionStorage.setItem('userId', res.data.userId);

          // Decode JWT to get restaurantId
          this.decodeAndStoreRestaurantId(token);

          const role = res.data.role;
          if (role === 'PLATFORM_ADMIN') {
            this.router.navigate(['/platform-admin']);
          } else if (role === 'ADMIN') {
            this.router.navigate(['/admin/dashboard']);
          } else if (role === 'STAFF') {
            this.router.navigate(['/staff/dashboard']);
          } else {
            this.router.navigate(['/customer']);
          }
        } else {
          this.error = res.message || 'Login failed';
        }
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.error?.message || 'Invalid credentials';
      }
    });
  }

  decodeAndStoreRestaurantId(token: string) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        if (payload.assignedRestaurantId) {
          sessionStorage.setItem('restaurantId', payload.assignedRestaurantId);
        }
      }
    } catch (e) {
      // Ignore decode errors
    }
  }
}

