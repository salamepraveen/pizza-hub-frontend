import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.html',
  styleUrl:'./admin-layout.css'
})
export class AdminLayout {
  sidebarOpen = true;

  constructor(private router: Router) {}

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout() {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  getUsername(): string {
    return sessionStorage.getItem('username') || 'ADMIN';
  }
}

