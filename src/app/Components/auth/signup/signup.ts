import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/authService/authService';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class Signup implements OnInit, OnDestroy {
  email = '';
  username = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';
  successMessage = '';
  step = 1;
  isLoading = false;
  otp = '';
  timer = 0;
  private timerInterval: any;

  constructor(
    private authService: AuthService,
    public router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {}

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  sendOtp() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.email.trim()) {
      this.errorMessage = 'Email is required';
      return;
    }

    if (!this.username.trim() || !this.password.trim()) {
      this.errorMessage = 'Username and password are required';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }
    if (this.password.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters';
      return;
    }

    this.isLoading = true;
    this.authService.requestSignupOtp({ email: this.email, username: this.username, password: this.password }).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.step = 2;
        this.successMessage = 'OTP sent to ' + this.email;
        this.startTimer();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to send OTP';
        this.cdr.detectChanges();
      }
    });
  }

  verifyAndCreate() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.otp.trim() || this.otp.length !== 6) {
      this.errorMessage = 'Please enter a valid 6-digit OTP';
      return;
    }

    this.isLoading = true;
    // Just verify the OTP; the backend creates the user since it has the details or gets them here
    this.authService.verifySignup({ email: this.email, otp: this.otp }).subscribe({
      next: (verifyRes: any) => {
        this.isLoading = false;
        this.router.navigate(['/login'], { queryParams: { verified: 'true' } });
      },
      error: (verifyErr: any) => {
        this.isLoading = false;
        this.errorMessage = verifyErr.error?.message || 'OTP verification failed';
      }
    });
  }

  resendOtp() {
    if (this.timer > 0) return;

    this.errorMessage = '';
    this.authService.requestSignupOtp({ email: this.email, username: this.username, password: this.password }).subscribe({
      next: (res: any) => {
        this.successMessage = 'OTP resent to ' + this.email;
        this.startTimer();
      },
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'Failed to resend OTP';
      }
    });
  }

  goBack() {
    this.step = 1;
    this.errorMessage = '';
    this.successMessage = '';
    this.otp = '';
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.timer = 0;
  }

  private startTimer() {
    this.timer = 60;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.timerInterval = setInterval(() => {
      this.timer--;
      if (this.timer <= 0) {
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }
}
