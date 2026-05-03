import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private api: ApiService) {}

  // POST /orders - Place order
  // Backend expects: { restaurantId, deliveryAddress, paymentMethod, items: [{ pizzaId, quantity, size, toppings }] }
  // Gateway adds X-User-Id, X-User-Role from JWT
  createOrder(data: { restaurantId: number; deliveryAddress: string; paymentMethod: string; items: { pizzaId: number; quantity: number; size?: string; toppings?: string[] }[] }) {
    return this.api.post('/orders', data);
  }

  // GET /orders/my - Customer's own orders
  // Gateway adds X-User-Id from JWT
  getMyOrders() {
    return this.api.get('/orders/my');
  }

  // GET /orders/restaurant - Admin/Staff restaurant orders
  // Gateway adds X-User-Id, X-User-Role, X-Restaurant-Id from JWT
  getRestaurantOrders() {
    return this.api.get('/orders/restaurant');
  }

  // PUT /orders/{id}/status?status=NEW_STATUS
  // Gateway adds X-User-Role from JWT
  updateStatus(orderId: number, status: string) {
    return this.api.put('/orders/' + orderId + '/status?status=' + status, {});
  }

  // POST /orders/{id}/cancel - Cancel order
  cancelOrder(orderId: number, reason: string) {
    return this.api.post('/orders/' + orderId + '/cancel', { reason: reason });
  }

  // POST /orders/{id}/payment/verify
  verifyPayment(orderId: number, paymentDetails: any) {
    return this.api.post('/orders/' + orderId + '/payment/verify', paymentDetails);
  }

  // ==================== REPORTS ====================

  getRevenue() {
    return this.api.get('/orders/reports/revenue');
  }

  getDailyRevenue(days: number = 7) {
    return this.api.get('/orders/reports/revenue/daily?days=' + days);
  }

  getPopularPizzas() {
    return this.api.get('/orders/reports/pizzas/popular');
  }

  getTopCustomers() {
    return this.api.get('/orders/reports/customers/top');
  }

  getOrderStatusSummary() {
    return this.api.get('/orders/reports/orders/status');
  }
}
