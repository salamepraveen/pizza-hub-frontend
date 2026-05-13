import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, of, throwError } from 'rxjs';


import { Cart } from './cart';
import { CartService } from '../../../services/cartservice/cartservice';
import { OrderService } from '../../../services/orderService/order.service';

describe('Cart', () => {
  let component: Cart;
  let fixture: ComponentFixture<Cart>;
  let cartServiceSpy: any;
  let orderServiceSpy: any;
  let routerSpy: any;
  let mockCartItems$ = new BehaviorSubject<any[]>([]);

  beforeEach(async () => {
    const cSpy = { updateQuantity: jasmine.createSpy(), removeItem: jasmine.createSpy(), clearCart: jasmine.createSpy(), getCartCount: jasmine.createSpy().and.returnValue(0), cart$: mockCartItems$.asObservable() };
    const oSpy = { createOrder: jasmine.createSpy(), verifyPayment: jasmine.createSpy() };
    const rSpy = { navigate: jasmine.createSpy() };

    await TestBed.configureTestingModule({
      imports: [Cart, FormsModule],
      providers: [
        { provide: CartService, useValue: cSpy },
        { provide: OrderService, useValue: oSpy },
        { provide: Router, useValue: rSpy },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Cart);
    component = fixture.componentInstance;
    cartServiceSpy = TestBed.inject(CartService);
    orderServiceSpy = TestBed.inject(OrderService);
    routerSpy = TestBed.inject(Router);
    fixture.detectChanges();
    sessionStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate total on init', () => {
    mockCartItems$.next([{ itemTotal: 10 }, { itemTotal: 20 }]);
    component.ngOnInit();
    expect(component.cartTotal).toBe(30);
  });

  it('should update quantity', () => {
    component.updateQuantity(0, 2);
    expect(cartServiceSpy.updateQuantity).toHaveBeenCalledWith(0, 2);
  });

  it('should remove item if quantity < 1', () => {
    component.updateQuantity(0, 0);
    expect(cartServiceSpy.removeItem).toHaveBeenCalledWith(0);
  });

  it('should remove item', () => {
    component.removeItem(0);
    expect(cartServiceSpy.removeItem).toHaveBeenCalledWith(0);
  });

  it('should clear cart', () => {
    component.clearCart();
    expect(cartServiceSpy.clearCart).toHaveBeenCalled();
  });

  it('should navigate to view pizza', () => {
    component.viewPizza(1);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/customer/pizza', 1]);
  });

  it('should open checkout', () => {
    component.openCheckout();
    expect(component.showCheckout).toBe(true);
  });

  it('should cancel checkout', () => {
    component.showCheckout = true;
    component.cancelCheckout();
    expect(component.showCheckout).toBe(false);
  });

  it('should not place order if address is empty', () => {
    component.deliveryAddress = '';
    component.placeOrder();
    expect(component.orderMessage).toBe('Please enter a delivery address');
  });

  it('should not place order if cart is empty', () => {
    component.deliveryAddress = '123 Main St';
    component.cartItems = [];
    component.placeOrder();
    expect(component.orderMessage).toBe('Your cart is empty.');
  });

  it('should place order COD successfully', () => {
    component.deliveryAddress = '123 Main St';
    component.paymentMode = 'COD';
    component.cartItems = [{ pizzaId: 1, quantity: 1, size: 'M', toppings: [{ name: 'Cheese' }], restaurantId: 1 }];
    orderServiceSpy.createOrder.and.returnValue(of({ message: 'Success' }));

    component.placeOrder();

    expect(orderServiceSpy.createOrder).toHaveBeenCalled();
    expect(component.orderSuccess).toBe(true);
    expect(component.orderMessage).toBe('Success');
    expect(cartServiceSpy.clearCart).toHaveBeenCalled();
  });

  it('should place order ONLINE and open gateway', () => {
    component.deliveryAddress = '123 Main St';
    component.paymentMode = 'ONLINE';
    component.cartItems = [{ pizzaId: 1, quantity: 1, size: 'M', toppings: [], restaurantId: 1 }];
    orderServiceSpy.createOrder.and.returnValue(of({ data: { id: 101 } }));

    component.placeOrder();

    expect(component.showPaymentGateway).toBe(true);
    expect(component.currentOrderId).toBe(101);
  });

  it('should simulate payment success', () => {
    component.currentOrderId = 101;
    orderServiceSpy.verifyPayment.and.returnValue(of({}));

    component.simulatePaymentSuccess();

    expect(component.orderSuccess).toBe(true);
    expect(component.showPaymentGateway).toBe(false);
    expect(cartServiceSpy.clearCart).toHaveBeenCalled();
  });

  it('should handle payment failure', () => {
    component.simulatePaymentFailure();
    expect(component.showPaymentGateway).toBe(false);
    expect(component.orderMessage).toContain('Payment failed');
    expect(cartServiceSpy.clearCart).toHaveBeenCalled();
  });
});
