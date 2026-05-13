import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';

import { CustomerOrders } from './customer-orders';
import { OrderService } from '../../../services/orderService/order.service';
import { MenuService } from '../../../services/menuService/menu.service';

describe('CustomerOrders', () => {
  let component: CustomerOrders;
  let fixture: ComponentFixture<CustomerOrders>;
  let oSpy: any;
  let mSpy: any;

  const mockOrders = [
    { id: 1, status: 'PLACED', items: [{ pizzaId: 1, size: 'M', toppings: ['Cheese'], quantity: 1 }] },
    { id: 2, status: 'DELIVERED', items: [] }
  ];

  const mockPizzas = [
    { id: 1, basePrice: 10, sizes: [{ size: 'M', price: 2 }] }
  ];

  const mockToppings = [
    { name: 'Cheese', price: 1 }
  ];

  beforeEach(async () => {
    oSpy = {
      getMyOrders: jasmine.createSpy().and.returnValue(of({ success: true, data: mockOrders })),
      cancelOrder: jasmine.createSpy().and.returnValue(of({}))
    };
    mSpy = {
      getAll: jasmine.createSpy().and.returnValue(of({ success: true, data: mockPizzas })),
      getToppings: jasmine.createSpy().and.returnValue(of({ data: mockToppings }))
    };

    await TestBed.configureTestingModule({
      imports: [CustomerOrders],
      providers: [
        provideRouter([]),
        { provide: OrderService, useValue: oSpy },
        { provide: MenuService, useValue: mSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerOrders);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load data', () => {
    expect(component).toBeTruthy();
    expect(component.orders.length).toBe(2);
    expect(component.activeOrders.length).toBe(1);
    expect(component.historyOrders.length).toBe(1);
    expect(component.orders[0].totalAmount).toBe(13);
  });

  it('should view order detail', () => {
    component.viewOrderDetail(component.orders[0]);
    expect(component.selectedOrder).toBe(component.orders[0]);
    component.viewOrderDetail(component.orders[0]);
    expect(component.selectedOrder).toBeNull();
  });

  it('should open and close cancel modal', () => {
    component.openCancelModal(component.orders[0], new Event('click'));
    expect(component.showCancelModal).toBe(true);
    expect(component.orderToCancel).toBe(component.orders[0]);
    
    component.closeCancelModal();
    expect(component.showCancelModal).toBe(false);
    expect(component.orderToCancel).toBeNull();
  });

  it('should handle cancel order', () => {
    component.orderToCancel = component.orders[0];
    component.cancelReason = 'Test';
    component.cancelOrder();
    expect(oSpy.cancelOrder).toHaveBeenCalledWith(1, 'Test');
    expect(oSpy.getMyOrders).toHaveBeenCalledTimes(2); // init + after cancel
  });

  it('should handle cancel without reason', () => {
    component.cancelReason = ' ';
    component.cancelOrder();
    expect(component.error).toBe('Please provide a reason for cancellation');
  });

  it('should handle cancel error', () => {
    component.orderToCancel = component.orders[0];
    component.cancelReason = 'Test';
    oSpy.cancelOrder.and.returnValue(throwError(() => ({ error: { message: 'Err' } })));
    component.cancelOrder();
    expect(component.error).toBe('Err');
  });

  it('should format dates and statuses', () => {
    expect(component.getStatusColor('PLACED')).toBe('#3498db');
    expect(component.getStatusLabel('PLACED')).toBe('Order Placed');
    expect(component.getPaymentStatus('')).toBe('PENDING');
    expect(component.getOrderDate('2026-05-07T10:00:00')).toContain('2026');
  });

  it('should handle order load error', () => {
    oSpy.getMyOrders.and.returnValue(throwError(() => new Error('Err')));
    component.loadOrders();
    expect(component.error).toBe('Failed to load orders');
  });
});
