import { TestBed } from '@angular/core/testing';
import { OrderService } from './order.service';
import { ApiService } from '../api.service';
import { of } from 'rxjs';

describe('OrderService', () => {
  let service: OrderService;
  let apiSpy: any;

  beforeEach(() => {
    apiSpy = {
      get: jasmine.createSpy('get').and.returnValue(of({})),
      post: jasmine.createSpy('post').and.returnValue(of({})),
      put: jasmine.createSpy('put').and.returnValue(of({}))
    };

    TestBed.configureTestingModule({
      providers: [
        OrderService,
        { provide: ApiService, useValue: apiSpy }
      ]
    });
    service = TestBed.inject(OrderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create order', () => {
    const data = { restaurantId: 1, deliveryAddress: '', paymentMethod: '', items: [] };
    service.createOrder(data);
    expect(apiSpy.post).toHaveBeenCalledWith('/orders', data);
  });

  it('should get my orders', () => {
    service.getMyOrders();
    expect(apiSpy.get).toHaveBeenCalledWith('/orders/my');
  });

  it('should get restaurant orders', () => {
    service.getRestaurantOrders();
    expect(apiSpy.get).toHaveBeenCalledWith('/orders/restaurant');
  });

  it('should update status', () => {
    service.updateStatus(1, 'CONFIRMED');
    expect(apiSpy.put).toHaveBeenCalledWith('/orders/1/status?status=CONFIRMED', {});
  });

  it('should cancel order', () => {
    service.cancelOrder(1, 'Reason');
    expect(apiSpy.post).toHaveBeenCalledWith('/orders/1/cancel', { reason: 'Reason' });
  });

  it('should verify payment', () => {
    service.verifyPayment(1, { foo: 'bar' });
    expect(apiSpy.post).toHaveBeenCalledWith('/orders/1/payment/verify', { foo: 'bar' });
  });

  it('should get revenue', () => {
    service.getRevenue();
    expect(apiSpy.get).toHaveBeenCalledWith('/orders/reports/revenue');
  });

  it('should get daily revenue', () => {
    service.getDailyRevenue(7);
    expect(apiSpy.get).toHaveBeenCalledWith('/orders/reports/revenue/daily?days=7');
  });

  it('should get popular pizzas', () => {
    service.getPopularPizzas();
    expect(apiSpy.get).toHaveBeenCalledWith('/orders/reports/pizzas/popular');
  });

  it('should get top customers', () => {
    service.getTopCustomers();
    expect(apiSpy.get).toHaveBeenCalledWith('/orders/reports/customers/top');
  });

  it('should get order status summary', () => {
    service.getOrderStatusSummary();
    expect(apiSpy.get).toHaveBeenCalledWith('/orders/reports/orders/status');
  });
});
