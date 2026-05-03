import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../services/orderService/order.service';
import { UserService } from '../../../services/userService/user.service';
import { MenuService } from '../../../services/menuService/menu.service';


@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class Orders implements OnInit {
  orders: any[] = [];
  filteredOrders: any[] = [];
  loading = true;
  error = '';
  selectedStatus = 'ALL';
  searchQuery = '';
  showDetailModal = false;
  selectedOrder: any = null;
  showCancelModal = false;
  cancelReason = '';
  currentTab: 'ACTIVE' | 'HISTORY' = 'ACTIVE';
  orderStatuses = ['PLACED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
  userMap: any = {};


  constructor(
    private orderService: OrderService,
    private userService: UserService,
    private menuService: MenuService,
    private cdr: ChangeDetectorRef
  ) { }


  ngOnInit() {
    this.loadOrders();
    this.loadUsers();
  }


  loadOrders() {
    this.loading = true;
    this.error = '';
    this.orderService.getRestaurantOrders().subscribe({
      next: (res: any) => {
        const fetchedOrders = res.data || res || [];
        
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
      error: (err) => { this.error = 'Failed to load orders'; this.loading = false; this.cdr.detectChanges(); }
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

  loadUsers() {
    this.userService.getRestaurantUsers().subscribe({
      next: (res: any) => {
        const users = res.data || res || [];
        users.forEach((u: any) => {
          this.userMap[u.id] = u.username;
        });
        this.cdr.detectChanges();
      },
      error: () => { }
    });
  }


  filterOrders() {
    this.filteredOrders = this.orders.filter(o => {
      const isHistory = ['DELIVERED', 'CANCELLED'].includes(o.status);
      const inTab = this.currentTab === 'ACTIVE' ? !isHistory : isHistory;
      if (!inTab) return false;

      const matchSearch = !this.searchQuery || o.id?.toString().includes(this.searchQuery) || o.userId?.toString().includes(this.searchQuery);
      const matchStatus = this.selectedStatus === 'ALL' || o.status === this.selectedStatus;
      return matchSearch && matchStatus;
    });
  }

  setTab(tab: 'ACTIVE' | 'HISTORY') {
    this.currentTab = tab;
    this.selectedStatus = 'ALL';
    this.filterOrders();
  }

  onFilterChange() { this.filterOrders(); }
  onSearch() { this.filterOrders(); }

  viewOrder(order: any) { this.selectedOrder = order; this.showDetailModal = true; }
  closeModal() { this.showDetailModal = false; this.selectedOrder = null; }

  updateStatus(orderId: any, newStatus: string) {
    this.orderService.updateStatus(orderId, newStatus).subscribe({
      next: () => { this.loadOrders(); },
      error: (err) => { this.error = err.error?.message || 'Failed to update status'; }
    });
  }

  openCancelModal(order: any) { this.selectedOrder = order; this.cancelReason = ''; this.showCancelModal = true; }

  cancelOrder() {
    if (!this.cancelReason.trim()) { this.error = 'Please provide a cancellation reason'; return; }
    if (!this.selectedOrder) return;
    this.orderService.cancelOrder(this.selectedOrder.id, this.cancelReason).subscribe({
      next: () => { this.showCancelModal = false; this.selectedOrder = null; this.loadOrders(); },
      error: (err) => { this.error = err.error?.message || 'Failed to cancel order'; }
    });
  }

  closeCancelModal() { this.showCancelModal = false; this.selectedOrder = null; }

  getStatusColor(s: string): string { return { PLACED: '#3498db', CONFIRMED: '#9b59b6', PREPARING: '#e67e22', OUT_FOR_DELIVERY: '#1abc9c', DELIVERED: '#27ae60', CANCELLED: '#e74c3c' }[s] || '#95a5a6'; }
  getPaymentColor(s: string): string { return { PENDING: '#f39c12', COMPLETED: '#27ae60', FAILED: '#e74c3c', PARTIALLY_REFUNDED: '#e67e22' }[s] || '#95a5a6'; }

  getNextAction(status: string): { nextStatus: string; label: string } | null {
    return { PLACED: { nextStatus: 'CONFIRMED', label: 'Confirm' }, CONFIRMED: { nextStatus: 'PREPARING', label: 'Start Preparing' }, PREPARING: { nextStatus: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' }, OUT_FOR_DELIVERY: { nextStatus: 'DELIVERED', label: 'Mark Delivered' } }[status] || null;
  }
}
