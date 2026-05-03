import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/userService/user.service';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css']
})
export class Settings implements OnInit {
  restaurantInfo: any = {};
  loading = false;
  error = '';
  message = '';
  user: any = { username: '', email: '', phoneNumber: '', address: '' };
  isEditing = false;
  showCreateModal = false;
  newRestaurantName = '';


  constructor(private userService: UserService, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.loadInfo();
    this.loadProfile();
  }


  loadInfo() {
    this.userService.getMyRestaurants().subscribe({
      next: (res: any) => { 
        this.restaurantInfo = res.data || res || {}; 
        this.cdr.detectChanges();
      },
      error: () => { }
    });
  }

  loadProfile() {
    this.loading = true;
    this.userService.getProfile().subscribe({
      next: (res: any) => {
        this.user = res.data || res || {};
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load profile';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    this.message = '';
    this.error = '';
  }

  saveProfile() {
    this.loading = true;
    this.message = '';
    this.error = '';
    this.userService.updateProfile(this.user).subscribe({
      next: (res: any) => {
        this.message = 'Profile updated successfully!';
        this.isEditing = false;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to update profile';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getSessionStorageItem(key: string): string | null {
    return sessionStorage.getItem(key);
  }
}

