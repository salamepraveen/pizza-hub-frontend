import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';


import { Dashboard } from './dashboard';
import { OrderService } from '../../../services/orderService/order.service';
import { MenuService } from '../../../services/menuService/menu.service';
import { UserService } from '../../../services/userService/user.service';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let orderServiceSpy: any;
  let menuServiceSpy: any;
  let userServiceSpy: any;

  beforeEach(async () => {
    const oSpy = {
      getRestaurantOrders: jasmine.createSpy(),
      getRevenue: jasmine.createSpy(),
      getOrderStatusSummary: jasmine.createSpy(),
      getPopularPizzas: jasmine.createSpy(),
      getTopCustomers: jasmine.createSpy(),
      getDailyRevenue: jasmine.createSpy()
    };
    const mSpy = { getAll: jasmine.createSpy() };
    const uSpy = { getRestaurantUsers: jasmine.createSpy() };

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        { provide: OrderService, useValue: oSpy },
        { provide: MenuService, useValue: mSpy },
        { provide: UserService, useValue: uSpy },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    orderServiceSpy = TestBed.inject(OrderService);
    menuServiceSpy = TestBed.inject(MenuService);
    userServiceSpy = TestBed.inject(UserService);

    // Setup default mock returns
    orderServiceSpy.getRestaurantOrders.and.returnValue(of({ data: [{ id: 1 }, { id: 2 }] }));
    orderServiceSpy.getRevenue.and.returnValue(of({ success: true, data: { totalRevenue: 1000, totalOrders: 10 } }));
    orderServiceSpy.getOrderStatusSummary.and.returnValue(of({ success: true, data: { delivered: 5, cancelled: 1, placed: 2, confirmed: 2 } }));
    orderServiceSpy.getPopularPizzas.and.returnValue(of({ success: true, data: [{ name: 'Pizza' }] }));
    orderServiceSpy.getTopCustomers.and.returnValue(of({ success: true, data: [{ userId: 1 }] }));
    orderServiceSpy.getDailyRevenue.and.returnValue(of({ success: true, data: [{ date: '2023-01-01', revenue: 100 }] }));
    menuServiceSpy.getAll.and.returnValue(of({ data: [{ id: 1 }] }));
    userServiceSpy.getRestaurantUsers.and.returnValue(of({ data: [{ id: 1, role: 'STAFF', username: 'staff1' }, { id: 2, role: 'ADMIN', username: 'admin1' }] }));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load dashboard data correctly', () => {
    expect(component.recentOrders.length).toBe(2);
    expect(component.stats.totalRevenue).toBe(1000);
    expect(component.stats.totalOrders).toBe(10);
    expect(component.stats.completedOrders).toBe(5);
    expect(component.stats.cancelledOrders).toBe(1);
    expect(component.stats.pendingOrders).toBe(4); // 2 + 2
    expect(component.popularPizzas.length).toBe(1);
    expect(component.topCustomers.length).toBe(1);
    expect(component.dailyRevenue.length).toBe(1);
    expect(component.stats.totalMenuItems).toBe(1);
    expect(component.stats.totalStaff).toBe(1); // Only 1 STAFF role
    expect(component.userMap[1]).toBe('staff1');
    expect(component.loading).toBe(false);
  });

  it('should handle error when loading orders', () => {
    orderServiceSpy.getRestaurantOrders.and.returnValue(throwError(() => new Error('Error')));
    component.loadDashboardData();
    expect(component.error).toContain('Could not load orders');
    expect(component.loading).toBe(false);
  });

  it('should return correct status colors', () => {
    expect(component.getStatusColor('PLACED')).toBe('#3498db');
    expect(component.getStatusColor('UNKNOWN')).toBe('#95a5a6');
  });

  it('should return correct payment colors', () => {
    expect(component.getPaymentColor('COMPLETED')).toBe('#27ae60');
    expect(component.getPaymentColor('UNKNOWN')).toBe('#95a5a6');
  });
});
