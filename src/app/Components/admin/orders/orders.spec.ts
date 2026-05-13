import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';


import { Orders } from './orders';
import { OrderService } from '../../../services/orderService/order.service';
import { UserService } from '../../../services/userService/user.service';
import { MenuService } from '../../../services/menuService/menu.service';

describe('Admin Orders Component', () => {
  let component: Orders;
  let fixture: ComponentFixture<Orders>;
  let orderServiceSpy: any;
  let userServiceSpy: any;
  let menuServiceSpy: any;

  beforeEach(async () => {
    const oSpy = { getRestaurantOrders: jasmine.createSpy(), updateStatus: jasmine.createSpy(), cancelOrder: jasmine.createSpy() };
    const uSpy = { getRestaurantUsers: jasmine.createSpy() };
    const mSpy = { getAll: jasmine.createSpy(), getToppings: jasmine.createSpy() };

    await TestBed.configureTestingModule({
      imports: [Orders, FormsModule],
      providers: [
        { provide: OrderService, useValue: oSpy },
        { provide: UserService, useValue: uSpy },
        { provide: MenuService, useValue: mSpy },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Orders);
    component = fixture.componentInstance;
    orderServiceSpy = TestBed.inject(OrderService);
    userServiceSpy = TestBed.inject(UserService);
    menuServiceSpy = TestBed.inject(MenuService);

    // Default mocks
    orderServiceSpy.getRestaurantOrders.and.returnValue(of({ data: [{ id: 1, status: 'PLACED', items: [{ pizzaId: 1, quantity: 1, size: 'MEDIUM', toppings: ['Cheese'] }] }] }));
    userServiceSpy.getRestaurantUsers.and.returnValue(of({ data: [{ id: 1, username: 'user1' }] }));
    menuServiceSpy.getAll.and.returnValue(of({ success: true, data: [{ id: 1, basePrice: 10, sizes: [{ size: 'MEDIUM', price: 2 }] }] }));
    menuServiceSpy.getToppings.and.returnValue(of({ data: [{ name: 'Cheese', price: 1 }] }));

    fixture.detectChanges();
  });

  it('should create and load data on init', () => {
    expect(component).toBeTruthy();
    expect(component.orders.length).toBe(1);
    expect(component.orders[0].totalAmount).toBe(13); // (10 + 2 + 1) * 1
    expect(component.filteredOrders.length).toBe(1);
    expect(component.userMap[1]).toBe('user1');
  });

  it('should filter orders by tab and search', () => {
    component.orders = [
      { id: 1, status: 'PLACED' },
      { id: 2, status: 'DELIVERED' },
      { id: 3, status: 'CANCELLED' }
    ];

    component.setTab('ACTIVE');
    expect(component.filteredOrders.length).toBe(1);

    component.setTab('HISTORY');
    expect(component.filteredOrders.length).toBe(2);

    component.searchQuery = '3';
    component.filterOrders();
    expect(component.filteredOrders.length).toBe(1);
    expect(component.filteredOrders[0].id).toBe(3);
  });

  it('should update order status', () => {
    orderServiceSpy.updateStatus.and.returnValue(of({ success: true }));
    orderServiceSpy.getRestaurantOrders.and.returnValue(of({ data: [] }));

    component.updateStatus(1, 'CONFIRMED');

    expect(orderServiceSpy.updateStatus).toHaveBeenCalledWith(1, 'CONFIRMED');
    expect(orderServiceSpy.getRestaurantOrders).toHaveBeenCalled();
  });

  it('should handle update status error', () => {
    orderServiceSpy.updateStatus.and.returnValue(throwError(() => ({ error: { message: 'Failed' } })));
    component.updateStatus(1, 'CONFIRMED');
    expect(component.error).toBe('Failed');
  });

  it('should cancel order', () => {
    component.openCancelModal({ id: 1 });
    component.cancelReason = 'Out of stock';
    orderServiceSpy.cancelOrder.and.returnValue(of({ success: true }));
    orderServiceSpy.getRestaurantOrders.and.returnValue(of({ data: [] }));

    component.cancelOrder();

    expect(orderServiceSpy.cancelOrder).toHaveBeenCalledWith(1, 'Out of stock');
    expect(component.showCancelModal).toBe(false);
    expect(orderServiceSpy.getRestaurantOrders).toHaveBeenCalled();
  });

  it('should require cancel reason', () => {
    component.openCancelModal({ id: 1 });
    component.cancelReason = '';
    component.cancelOrder();
    expect(component.error).toBe('Please provide a cancellation reason');
    expect(orderServiceSpy.cancelOrder).not.toHaveBeenCalled();
  });

  it('should return next action', () => {
    expect(component.getNextAction('PLACED')).toEqual({ nextStatus: 'CONFIRMED', label: 'Confirm' });
    expect(component.getNextAction('DELIVERED')).toBeNull();
  });
});
