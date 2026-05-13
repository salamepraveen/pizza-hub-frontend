import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';

import { StaffOrders } from './staff-orders';
import { OrderService } from '../../../services/orderService/order.service';
import { UserService } from '../../../services/userService/user.service';
import { MenuService } from '../../../services/menuService/menu.service';

describe('StaffOrders', () => {
  let component: StaffOrders;
  let fixture: ComponentFixture<StaffOrders>;
  let oSpy: any;
  let uSpy: any;
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
      getRestaurantOrders: jasmine.createSpy().and.returnValue(of({ data: mockOrders })),
      updateStatus: jasmine.createSpy().and.returnValue(of({}))
    };
    uSpy = {
      getRestaurantUsers: jasmine.createSpy().and.returnValue(of({ data: [{ id: 1, username: 'testuser' }] }))
    };
    mSpy = {
      getAll: jasmine.createSpy().and.returnValue(of({ success: true, data: mockPizzas })),
      getToppings: jasmine.createSpy().and.returnValue(of({ data: mockToppings }))
    };

    await TestBed.configureTestingModule({
      imports: [StaffOrders, FormsModule],
      providers: [
        { provide: OrderService, useValue: oSpy },
        { provide: UserService, useValue: uSpy },
        { provide: MenuService, useValue: mSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StaffOrders);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load data', () => {
    expect(component).toBeTruthy();
    expect(component.orders.length).toBe(2);
    expect(component.orders[0].totalAmount).toBe(13); // 10 + 2 + 1
    expect(component.filteredOrders.length).toBe(1); // ACTIVE tab
  });

  it('should filter by tab', () => {
    component.setTab('HISTORY');
    expect(component.currentTab).toBe('HISTORY');
    expect(component.filteredOrders.length).toBe(1);
    expect(component.filteredOrders[0].status).toBe('DELIVERED');
  });

  it('should handle topping fetch error', () => {
    mSpy.getToppings.and.returnValue(throwError(() => new Error('err')));
    component.loadOrders();
    expect(component.orders[0].totalAmount).toBe(12); // No toppings price
  });

  it('should handle menu fetch error', () => {
    mSpy.getAll.and.returnValue(throwError(() => new Error('err')));
    component.loadOrders();
    expect(component.orders.length).toBe(2); // Unmodified totals
  });

  it('should handle order fetch error', () => {
    oSpy.getRestaurantOrders.and.returnValue(throwError(() => new Error('err')));
    component.loadOrders();
    expect(component.loading).toBe(false);
  });

  it('should update status', () => {
    component.updateStatus(1, 'CONFIRMED');
    expect(oSpy.updateStatus).toHaveBeenCalledWith(1, 'CONFIRMED');
    expect(oSpy.getRestaurantOrders).toHaveBeenCalledTimes(2); // once on init, once on load
  });

  it('should handle status update error', () => {
    oSpy.updateStatus.and.returnValue(throwError(() => new Error('err')));
    component.updateStatus(1, 'CONFIRMED');
    expect(oSpy.updateStatus).toHaveBeenCalledWith(1, 'CONFIRMED');
  });

  it('should get correct status color and next action', () => {
    expect(component.getStatusColor('PLACED')).toBe('#3498db');
    const action = component.getNextAction('PLACED');
    expect(action?.nextStatus).toBe('CONFIRMED');
    expect(component.getNextAction('DELIVERED')).toBeNull();
  });
});
