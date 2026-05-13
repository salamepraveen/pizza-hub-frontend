import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlatformAdminService } from '../../services/platform-admin.service';

@Component({
  selector: 'app-platform-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './platform-admin-dashboard.component.html',
  styleUrls: ['./platform-admin-dashboard.component.css']
})
export class PlatformAdminDashboardComponent implements OnInit {
  activeTab: 'users' | 'restaurants' = 'users';
  users: any[] = [];
  restaurants: any[] = [];
  loading = false;
  error = '';
  searchQuery: string = '';

  constructor(
    private adminService: PlatformAdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  setTab(tab: 'users' | 'restaurants'): void {
    this.activeTab = tab;
    this.searchQuery = ''; // Reset search on tab change
    this.loadData();
  }

  get filteredUsers(): any[] {
    if (!this.searchQuery) return this.users;
    const q = this.searchQuery.toLowerCase();
    return this.users.filter(u => 
      u?.username?.toLowerCase().includes(q) || 
      u?.email?.toLowerCase().includes(q)
    );
  }

  get filteredRestaurants(): any[] {
    if (!this.searchQuery) return this.restaurants;
    const q = this.searchQuery.toLowerCase();
    return this.restaurants.filter(r => 
      r?.name?.toLowerCase().includes(q) || 
      r?.city?.toLowerCase().includes(q) ||
      r?.address?.toLowerCase().includes(q)
    );
  }

  loadData(): void {
    this.loading = true;
    this.error = '';
    
    if (this.activeTab === 'users') {
      this.adminService.getAllUsers().subscribe({
        next: (res: any) => {
          this.users = res?.data || [];
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          this.error = 'Failed to load users';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.adminService.getAllRestaurants().subscribe({
        next: (res: any) => {
          this.restaurants = res?.data || [];
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          this.error = 'Failed to load restaurants';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  toggleUserBan(user: any): void {
    this.adminService.toggleBanUser(user.id).subscribe({
      next: (res: any) => {
        user.banned = res.data.banned;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to toggle ban status';
        this.cdr.detectChanges();
      }
    });
  }

  toggleRestaurantBan(restaurant: any): void {
    this.adminService.toggleBanRestaurant(restaurant.id).subscribe({
      next: (res: any) => {
        restaurant.banned = res.data.banned;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to toggle ban status';
        this.cdr.detectChanges();
      }
    });
  }
}
