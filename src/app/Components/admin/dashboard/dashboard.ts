import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../services/orderService/order.service';
import { MenuService } from '../../../services/menuService/menu.service';
import { UserService } from '../../../services/userService/user.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls:['./dashboard.css']
})
export class Dashboard implements OnInit {
  stats = {
    totalOrders: 0, pendingOrders: 0, completedOrders: 0,
    cancelledOrders: 0, totalMenuItems: 0, totalStaff: 0, totalRevenue: 0
  };
  recentOrders: any[] = [];
  popularPizzas: any[] = [];
  topCustomers: any[] = [];
  dailyRevenue: any[] = [];
  userMap: any = {};
  
  loading = true;
  error = '';

  constructor(
    private orderService: OrderService,
    private menuService: MenuService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;
    this.error = '';

    // Fetch basic orders for recent orders table
    this.orderService.getRestaurantOrders().subscribe({
      next: (res: any) => {
        const orders = res.data || res || [];
        this.recentOrders = orders.slice(0, 5);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Could not load orders. Make sure your token has a valid restaurantId.';
        this.loading = false;
      }
    });

    // Fetch Revenue
    this.orderService.getRevenue().subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.stats.totalRevenue = res.data.totalRevenue || 0;
          this.stats.totalOrders = res.data.totalOrders || 0;
        }
      }
    });

    // Fetch Order Status Summary
    this.orderService.getOrderStatusSummary().subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.stats.completedOrders = res.data.delivered || 0;
          this.stats.cancelledOrders = res.data.cancelled || 0;
          this.stats.pendingOrders = (res.data.placed || 0) + (res.data.confirmed || 0) + (res.data.preparing || 0) + (res.data.outForDelivery || 0);
        }
      }
    });

    // Fetch Popular Pizzas
    this.orderService.getPopularPizzas().subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.popularPizzas = res.data.slice(0, 5);
        }
      }
    });

    // Fetch Top Customers
    this.orderService.getTopCustomers().subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.topCustomers = res.data.slice(0, 5);
        }
      }
    });

    // Fetch Daily Revenue
    this.orderService.getDailyRevenue(7).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.dailyRevenue = res.data;
        }
      }
    });

    this.menuService.getAll().subscribe({
      next: (res: any) => {
        this.stats.totalMenuItems = (res.data || res || []).length;
      },
      error: () => {}
    });

    this.userService.getRestaurantUsers().subscribe({
      next: (res: any) => {
        const users = res.data || res || [];
        this.stats.totalStaff = users.filter((u: any) => u.role === 'STAFF').length;
        users.forEach((u: any) => {
          this.userMap[u.id] = u.username;
        });
      },
      error: () => {}
    });
  }

  getStatusColor(status: string): string {
    const c: any = {PLACED:'#3498db',CONFIRMED:'#9b59b6',PREPARING:'#e67e22',OUT_FOR_DELIVERY:'#1abc9c',DELIVERED:'#27ae60',CANCELLED:'#e74c3c'};
    return c[status] || '#95a5a6';
  }

  getPaymentColor(status: string): string {
    const c: any = {PENDING:'#f39c12',COMPLETED:'#27ae60',FAILED:'#e74c3c',PARTIALLY_REFUNDED:'#e67e22'};
    return c[status] || '#95a5a6';
  }
}
