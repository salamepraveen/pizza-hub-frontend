import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/authService/authService';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class CustomerProfile implements OnInit {
  user: any = {};
  originalUser: any = {};
  isEditing = false;
  loading = false;
  message = '';
  error = '';

  constructor(private http: HttpClient, private authService: AuthService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    const username = sessionStorage.getItem('username');
    const token = sessionStorage.getItem('token');
    if (!username || !token) return;
    this.loading = true;
    this.http.get(`/users/username/${username}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: (res: any) => {
        // The API returns the raw user DTO, but wait, the endpoint /users/email/{email} doesn't use ApiResponse.
        // It returns UserDTO directly
        this.user = res.data || res;
        this.originalUser = { ...this.user };
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Failed to load profile';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.user = { ...this.originalUser };
    }
    this.message = '';
    this.error = '';
  }

  saveProfile() {
    this.loading = true;
    this.message = '';
    this.error = '';
    const payload = {
      email: this.user.email,
      phoneNumber: this.user.phoneNumber,
      address: this.user.address
    };

    // Make sure we have the token for authorization
    const token = sessionStorage.getItem('token');
    
    this.http.put(`/users/profile`, payload, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.user = res.data;
          this.originalUser = { ...this.user };
          this.isEditing = false;
          this.message = 'Profile updated successfully!';
        } else {
          this.error = res.message || 'Failed to update profile';
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.error?.message || 'Error updating profile';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
