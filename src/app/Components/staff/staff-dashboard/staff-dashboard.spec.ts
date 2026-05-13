import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';

import { StaffDashboard } from './staff-dashboard';
import { OrderService } from '../../../services/orderService/order.service';
import { UserService } from '../../../services/userService/user.service';

describe('StaffDashboard', () => {
  let component: StaffDashboard;
  let fixture: ComponentFixture<StaffDashboard>;
  let oSpy: any;
  let uSpy: any;

  const mockOrders = [
    { id: 1, status: 'PLACED' },
    { id: 2, status: 'PREPARING' },
    { id: 3, status: 'OUT_FOR_DELIVERY' },
    { id: 4, status: 'DELIVERED' },
    { id: 5, status: 'CANCELLED' },
    { id: 6, status: 'CONFIRMED' }
  ];

  beforeEach(async () => {
    oSpy = {
      getRestaurantOrders: jasmine.createSpy().and.returnValue(of({ data: mockOrders })),
      getDailyRevenue: jasmine.createSpy().and.returnValue(of({ data: [{ revenue: 500 }] }))
    };
    uSpy = {
      getRestaurantUsers: jasmine.createSpy().and.returnValue(of({ data: [{ id: 1, username: 'testuser' }] }))
    };

    await TestBed.configureTestingModule({
      imports: [StaffDashboard],
      providers: [
        provideRouter([]),
        { provide: OrderService, useValue: oSpy },
        { provide: UserService, useValue: uSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StaffDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load data', () => {
    expect(component).toBeTruthy();
    expect(component.userMap[1]).toBe('testuser');
    expect(component.recentOrders.length).toBe(6);
    expect(component.stats.placed).toBe(2);
    expect(component.stats.preparing).toBe(1);
    expect(component.stats.outForDelivery).toBe(1);
    expect(component.stats.delivered).toBe(1);
    expect(component.stats.cancelled).toBe(1);
    expect(component.dailyRevenue).toBe(500);
  });

  it('should get status color', () => {
    expect(component.getStatusColor('PLACED')).toBe('#3498db');
    expect(component.getStatusColor('UNKNOWN')).toBe('#95a5a6');
  });

  it('should handle errors gracefully', () => {
    oSpy.getRestaurantOrders.and.returnValue(throwError(() => new Error('err')));
    component.loadData();
    expect(component.loading).toBe(false);
  });
});
