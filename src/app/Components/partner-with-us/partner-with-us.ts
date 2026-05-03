import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/authService/authService';
import { UserService } from '../../services/userService/user.service';

@Component({
  selector: 'app-partner-with-us',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './partner-with-us.html',
  styleUrls: ['./partner-with-us.css']
})
export class PartnerWithUs implements OnInit {
  // Step Management: 1 = Auth, 2 = Restaurant Details, 3 = Success
  currentStep = 1;

  // Auth Form
  isLoginMode = false; // false = Register, true = Login
  email = '';
  username = '';
  password = '';
  authError = '';
  authLoading = false;

  // Restaurant Form
  restaurantName = '';
  city = '';
  address = '';
  restaurantError = '';
  restaurantLoading = false;

  constructor(
    private http: HttpClient, 
    public router: Router,
    private authService: AuthService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.checkAuthStatus();
  }

  checkAuthStatus() {
    const token = sessionStorage.getItem('token');
    if (token) {
      this.currentStep = 2; // Skip to restaurant details if already logged in
    } else {
      this.currentStep = 1;
    }
  }

  toggleAuthMode() {
    this.isLoginMode = !this.isLoginMode;
    this.authError = '';
  }

  submitAuth() {
    this.authError = '';
    
    if (this.isLoginMode) {
      if (!this.username || !this.password || !this.email) {
        this.authError = 'Please enter email, username and password.';
        return;
      }
      this.authLoading = true;
      this.authService.login({ username: this.username, password: this.password, email: this.email }).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.handleSuccessfulAuth(res.data);
          } else {
            this.authError = res.message || 'Login failed';
          }
          this.authLoading = false;
        },
        error: (err: any) => {
          this.authError = err.error?.message || 'Invalid credentials';
          this.authLoading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      // Registration Mode
      if (!this.email || !this.username || !this.password) {
        this.authError = 'Please fill all fields.';
        return;
      }
      this.authLoading = true;
      // We will skip OTP for the partner flow to reduce friction, we call the internal API directly
      // Wait, we don't have an open internal API for frontend. We must use signup.
      // Actually, if we use authService.signup, it registers directly if it's the right endpoint, but wait...
      // The auth-service POST /auth/signup creates the user.
      this.authService.signup({ email: this.email, username: this.username, password: this.password }).subscribe({
        next: (res: any) => {
          if (res.success || res.message === 'User registered successfully') {
            // Auto login after signup to get the token
            this.authService.login({ username: this.username, password: this.password, email: this.email }).subscribe({
              next: (loginRes: any) => {
                if (loginRes.success) {
                  this.handleSuccessfulAuth(loginRes.data);
                } else {
                  this.authError = loginRes.message || 'Auto-login failed. Please sign in manually.';
                  this.authLoading = false;
                }
              },
              error: (loginErr: any) => {
                this.authError = loginErr.error?.message || 'Auto-login failed. Please sign in manually.';
                this.authLoading = false;
              }
            });
          } else {
            this.authError = res.message || 'Registration failed';
            this.authLoading = false;
          }
        },
        error: (err: any) => {
          this.authError = err.error?.message || 'Error during registration. Username might exist.';
          this.authLoading = false;
        }
      });
    }
  }

  handleSuccessfulAuth(data: any) {
    sessionStorage.setItem('token', data.token);
    sessionStorage.setItem('username', data.username);
    sessionStorage.setItem('role', data.role);
    sessionStorage.setItem('userId', data.userId);
    sessionStorage.setItem('email', data.email || this.email);
    this.authLoading = false;
    this.currentStep = 2; // Proceed to restaurant details
  }

  submitPartnership() {
    if (!this.restaurantName.trim() || !this.city.trim() || !this.address.trim()) {
      this.restaurantError = 'Please fill all restaurant fields.';
      return;
    }

    this.restaurantLoading = true;
    this.restaurantError = '';

    const payload = { 
      name: this.restaurantName,
      city: this.city,
      address: this.address
    };
    
    this.userService.createRestaurant(payload).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.currentStep = 3; // Success step
          setTimeout(() => {
            sessionStorage.clear(); // Require re-login for new role
            this.router.navigate(['/login']);
          }, 4000);
        } else {
          this.restaurantError = res.message || 'Failed to submit application.';
        }
        this.restaurantLoading = false;
      },
      error: (err: any) => {
        this.restaurantError = err.error?.message || 'Something went wrong. Only USER role can create a restaurant.';
        this.restaurantLoading = false;
      }
    });
  }
}
