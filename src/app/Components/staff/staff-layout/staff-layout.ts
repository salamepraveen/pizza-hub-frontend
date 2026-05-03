import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-staff-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './staff-layout.html',
  styleUrl: './staff-layout.css'
})
export class StaffLayout {
  sidebarOpen = true;
  constructor(private router: Router) {}
  toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; }
  logout() { sessionStorage.clear(); this.router.navigate(['/login']); }
  getUsername(): string { return sessionStorage.getItem('username') || 'Staff'; }
}

