import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../services/orderService/order.service';
import { UserService } from '../../../services/userService/user.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-staff-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './staff-dashboard.html',
  styleUrl: './staff-dashboard.css'
})
export class StaffDashboard implements OnInit {
  stats = { placed: 0, preparing: 0, outForDelivery: 0, delivered: 0, cancelled: 0 };
  recentOrders: any[] = [];
  dailyRevenue = 0;
  loading = true;
  userMap: any = {};

  constructor(
    private orderService: OrderService,
    private userService: UserService
  ) { }
  
  ngOnInit() { 
    this.loadUsers();
    this.loadData(); 
  }

  loadUsers() {
    this.userService.getRestaurantUsers().subscribe({
      next: (res: any) => {
        const users = res.data || res || [];
        users.forEach((u: any) => {
          this.userMap[u.id] = u.username;
        });
      }
    });
  }

  loadData() {
    this.orderService.getRestaurantOrders().subscribe({
      next: (res: any) => {
        const orders = res.data || res || [];
        // Sort by id descending so newest are first
        orders.sort((a: any, b: any) => b.id - a.id);
        this.recentOrders = orders.slice(0, 15);
        this.stats.placed = orders.filter((o: any) => ['PLACED', 'CONFIRMED'].includes(o.status)).length;
        this.stats.preparing = orders.filter((o: any) => o.status === 'PREPARING').length;
        this.stats.outForDelivery = orders.filter((o: any) => o.status === 'OUT_FOR_DELIVERY').length;
        this.stats.delivered = orders.filter((o: any) => o.status === 'DELIVERED').length;
        this.stats.cancelled = orders.filter((o: any) => o.status === 'CANCELLED').length;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });

    this.orderService.getDailyRevenue(1).subscribe({
      next: (res: any) => {
        const data = res.data || [];
        if (data.length > 0) {
          this.dailyRevenue = data[data.length - 1].revenue || 0;
        }
      }
    });
  }

  getStatusColor(s: string): string { return { PLACED: '#3498db', CONFIRMED: '#9b59b6', PREPARING: '#e67e22', OUT_FOR_DELIVERY: '#1abc9c', DELIVERED: '#27ae60', CANCELLED: '#e74c3c' }[s] || '#95a5a6'; }
}
