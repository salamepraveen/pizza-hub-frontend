import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/userService/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-staff-mgmt',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './staff-mgmt.html',
  styleUrl: './staff-mgmt.css'
})
export class StaffMgmt implements OnInit {
  users: any[] = [];
  loading = true;
  error = '';
  success = '';

  // Search & Filter
  searchQuery = '';
  selectedFilter = 'ALL';

  // Promote Modal
  showPromoteModal = false;
  promoteTarget: any = null;
  promoteRole = 'STAFF';

  constructor(
    public router: Router,
    private userService: UserService
  ) {}

  currentUserId: number | null = null;

  ngOnInit() {
    const userIdStr = sessionStorage.getItem('userId');
    if (userIdStr) {
      this.currentUserId = parseInt(userIdStr, 10);
    }
    this.loadUsers();
  }

  get filteredUsers(): any[] {
    let result = [...this.users];

    // Filter by role
    if (this.selectedFilter !== 'ALL') {
      result = result.filter(u => u.role === this.selectedFilter);
    }

    // Filter by search query
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(u =>
        u.username?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      );
    }

    return result;
  }

  getAdminCount(): number {
    return this.users.filter(u => u.role === 'ADMIN').length;
  }

  getStaffCount(): number {
    return this.users.filter(u => u.role === 'STAFF').length;
  }

  getUserCount(): number {
    return this.users.filter(u => u.role === 'USER').length;
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'ADMIN': return 'badge-admin';
      case 'STAFF': return 'badge-staff';
      default: return 'badge-user';
    }
  }

  onSearch() {
    // filteredUsers getter handles this automatically
  }

  onFilterChange() {
    // filteredUsers getter handles this automatically
  }

  loadUsers() {
    this.loading = true;
    this.userService.getRestaurantUsers().subscribe({
      next: (res: any) => {
        this.users = res.data || res || [];
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Failed to load staff members';
        this.loading = false;
      }
    });
  }

  openPromoteModal(user: any) {
    this.promoteTarget = user;
    this.promoteRole = 'STAFF';
    this.showPromoteModal = true;
  }

  closePromoteModal() {
    this.showPromoteModal = false;
    this.promoteTarget = null;
  }

  promoteUser() {
    if (!this.promoteTarget) return;

    const targetRole = this.promoteRole;

    this.userService.promote(this.promoteTarget.id, targetRole).subscribe({
      next: (res: any) => {
        this.success = this.promoteTarget.username + ' promoted to ' + targetRole + ' successfully';
        this.closePromoteModal();
        this.loadUsers();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Failed to promote user';
      }
    });
  }

  demoteUser(user: any) {
    if (confirm('Demote ' + user.username + ' to USER?')) {
      this.userService.demote(user.id).subscribe({
        next: (res: any) => {
          this.success = user.username + ' demoted to USER successfully';
          this.loadUsers();
          setTimeout(() => this.success = '', 3000);
        },
        error: (err: any) => {
          this.error = err.error?.message || 'Failed to demote user';
        }
      });
    }
  }
}
