import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/authService/authService';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-otp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './otp.html',
  styleUrl: './otp.css'
})
export class OtpVerify implements OnInit {
  email = '';
  otp = '';
  error = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    public router: Router
  ) {}

  ngOnInit() {
    this.email = this.route.snapshot.queryParamMap.get('email') || '';
  }

  verifyOtp() {
    if (!this.otp.trim() || this.otp.length !== 6) {
      this.error = 'Please enter a valid 6-digit OTP';
      return;
    }
    this.loading = true;
    this.authService.verifySignup({ email: this.email, otp: this.otp }).subscribe({
      next: (res: any) => {
        this.router.navigate(['/login'], { queryParams: { verified: 'true' } });
      },
      error: (err: any) => {
        this.error = err.error?.message || 'OTP verification failed';
        this.loading = false;
      }
    });
  }

  resendOtp() {
    this.error = '';
    this.authService.requestSignupOtp({ email: this.email, username: '' }).subscribe({
      next: (res: any) => {
        alert('OTP sent to ' + this.email);
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Failed to resend OTP';
      }
    });
  }
}
