import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OrderService } from '../../../services/orderService/order.service';
import { MenuService } from '../../../services/menuService/menu.service';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-customer-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-orders.html',
  styleUrls:['./customer-orders.css']
})
export class CustomerOrders implements OnInit {
  orders: any[] = [];
  loading = true;
  error = '';
  selectedOrder: any = null;

  showCancelModal = false;
  cancelReason = '';
  orderToCancel: any = null;

  statusColors: any = {
    PLACED: '#3498db',
    CONFIRMED: '#9b59b6',
    PREPARING: '#f39c12',
    OUT_FOR_DELIVERY: '#e67e22',
    DELIVERED: '#27ae60',
    CANCELLED: '#e74c3c'
  };

  constructor(
    private orderService: OrderService,
    private menuService: MenuService,
    public router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading = true;
    this.orderService.getMyOrders().subscribe({
      next: (res: any) => {
        const fetchedOrders = res.success ? (res.data || []) : (res.data || []);
        
        this.menuService.getAll().subscribe({
          next: (menuRes: any) => {
            const allPizzas = menuRes.success ? (menuRes.data || []) : [];
            this.menuService.getToppings().subscribe({
              next: (topRes: any) => {
                const allToppings = topRes.data || topRes || [];
                this.orders = this.recalculateOrderTotals(fetchedOrders, allPizzas, allToppings);
                this.filterOrders();
                this.loading = false;
                this.cdr.detectChanges();
              },
              error: () => {
                this.orders = this.recalculateOrderTotals(fetchedOrders, allPizzas, []);
                this.filterOrders();
                this.loading = false;
                this.cdr.detectChanges();
              }
            });
          },
          error: () => {
            this.orders = fetchedOrders;
            this.filterOrders();
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: (err: any) => {
        this.error = 'Failed to load orders';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  recalculateOrderTotals(orders: any[], allPizzas: any[], allToppings: any[]): any[] {
    return orders.map(order => {
      let trueTotal = 0;
      const items = order.items || order.orderItems || [];
      items.forEach((item: any) => {
        const pizza = allPizzas.find(p => p.id === item.pizzaId);
        let itemPrice = item.price || 0; 

        if (pizza) {
          const basePrice = pizza.basePrice || pizza.price || 0;
          let sizePrice = 0;
          
          if (pizza.sizes && item.size) {
            const sizeObj = pizza.sizes.find((s: any) => s.size === item.size);
            if (sizeObj) sizePrice = sizeObj.price;
          }

          let toppingsPrice = 0;
          if (item.toppings && Array.isArray(item.toppings)) {
            item.toppings.forEach((topStr: string) => {
              const tObj = allToppings.find(t => t.name === topStr);
              if (tObj && tObj.price) toppingsPrice += tObj.price;
            });
          }

          itemPrice = basePrice + sizePrice + toppingsPrice;
        }
        
        item.itemTotal = itemPrice * item.quantity;
        item.price = itemPrice; 
        trueTotal += item.itemTotal;
      });
      order.totalAmount = trueTotal;
      order.total = trueTotal;
      return order;
    });
  }

  viewOrderDetail(order: any) {
    this.selectedOrder = this.selectedOrder?.id === order.id ? null : order;
  }

  openCancelModal(order: any, event: Event) {
    event.stopPropagation();
    this.orderToCancel = order;
    this.cancelReason = '';
    this.showCancelModal = true;
  }

  closeCancelModal() {
    this.showCancelModal = false;
    this.orderToCancel = null;
    this.cancelReason = '';
  }

  cancelOrder() {
    if (!this.cancelReason.trim()) {
      this.error = 'Please provide a reason for cancellation';
      return;
    }
    
    this.loading = true;
    this.orderService.cancelOrder(this.orderToCancel.id, this.cancelReason).subscribe({
      next: (res: any) => {
        this.closeCancelModal();
        this.loadOrders(); 
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Failed to cancel order';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  activeOrders: any[] = [];
  historyOrders: any[] = [];

  filterOrders() {
    this.activeOrders = this.orders.filter(o => 
      ['PLACED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY'].includes(o.status)
    );
    this.historyOrders = this.orders.filter(o => 
      ['DELIVERED', 'CANCELLED'].includes(o.status)
    );
  }

  getStatusColor(status: string): string {
    return this.statusColors[status] || '#999';
  }

  getStatusLabel(status: string): string {
    const labels: any = {
      PLACED: 'Order Placed',
      CONFIRMED: 'Confirmed',
      PREPARING: 'Preparing',
      OUT_FOR_DELIVERY: 'Out for Delivery',
      DELIVERED: 'Delivered',
      CANCELLED: 'Cancelled'
    };
    return labels[status] || status;
  }

  getOrderDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  getPaymentStatus(paymentStatus: string): string {
    return paymentStatus || 'PENDING';
  }
}
