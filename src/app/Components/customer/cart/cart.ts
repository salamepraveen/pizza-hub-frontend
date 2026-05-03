import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../../services/cartservice/cartservice';
import { OrderService } from '../../../services/orderService/order.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class Cart implements OnInit {
  cartItems: any[] = [];
  cartTotal = 0;
  showCheckout = false;
  deliveryAddress = '';
  paymentMode = 'COD';
  placingOrder = false;
  orderSuccess = false;
  orderMessage = '';

  // Payment Gateway Simulator state
  showPaymentGateway = false;
  currentOrderId: number | null = null;
  processingPayment = false;

  constructor(
    public cartService: CartService,
    public router: Router,
    private orderService: OrderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
      this.calculateTotal();
    });
  }

  calculateTotal() {
    this.cartTotal = this.cartItems.reduce((sum, item) => sum + item.itemTotal, 0);
  }

  updateQuantity(index: number, newQty: number) {
    if (newQty < 1) {
      this.removeItem(index);
      return;
    }
    this.cartService.updateQuantity(index, newQty);
  }

  removeItem(index: number) {
    this.cartService.removeItem(index);
  }

  clearCart() {
    this.cartService.clearCart();
  }

  viewPizza(pizzaId: number) {
    this.router.navigate(['/customer/pizza', pizzaId]);
  }

  openCheckout() {
    this.showCheckout = true;
  }

  cancelCheckout() {
    this.showCheckout = false;
  }

  placeOrder() {
    if (!this.deliveryAddress.trim()) {
      this.orderMessage = 'Please enter a delivery address';
      return;
    }

    if (this.cartItems.length === 0) {
      this.orderMessage = 'Your cart is empty.';
      return;
    }

    // Try to get restaurantId from sessionStorage (for STAFF/ADMIN), otherwise use the restaurantId of the first pizza in the cart
    let restaurantId = sessionStorage.getItem('restaurantId');
    if (!restaurantId) {
       restaurantId = String(this.cartItems[0].restaurantId || 1);
    }

    if (!restaurantId) {
      this.orderMessage = 'No restaurant found. Please create or select a restaurant first.';
      return;
    }

    this.placingOrder = true;
    this.orderMessage = '';

    // Send size and toppings to backend
    const orderItems = this.cartItems.map(item => ({
      pizzaId: item.pizzaId,
      quantity: item.quantity,
      size: item.size,
      toppings: item.toppings ? item.toppings.map((t: any) => t.name) : []
    }));

    const orderData = {
      restaurantId: Number(restaurantId),
      deliveryAddress: this.deliveryAddress,
      paymentMethod: this.paymentMode,
      items: orderItems
    };

    this.orderService.createOrder(orderData).subscribe({
      next: (response: any) => {
        this.placingOrder = false;
        this.showCheckout = false;
        
        if (this.paymentMode === 'ONLINE' && response.data?.id) {
          // Open Simulated Payment Gateway
          this.currentOrderId = response.data.id;
          this.showPaymentGateway = true;
          this.cdr.detectChanges();
        } else {
          // COD - finish order
          this.finalizeOrderSuccess(response.message || 'Your order has been placed successfully!');
        }
      },
      error: (error: any) => {
        this.placingOrder = false;
        this.orderMessage = error.error?.message || 'Failed to place order. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }

  simulatePaymentSuccess() {
    if (!this.currentOrderId) return;
    
    this.processingPayment = true;
    const paymentDetails = {
      razorpayOrderId: 'order_mock_' + this.currentOrderId,
      razorpayPaymentId: 'pay_mock_' + Math.floor(Math.random() * 1000000),
      razorpaySignature: 'mock_signature'
    };
    
    this.orderService.verifyPayment(this.currentOrderId, paymentDetails).subscribe({
      next: (res: any) => {
        this.processingPayment = false;
        this.showPaymentGateway = false;
        this.finalizeOrderSuccess('Payment successful, Order confirmed');
      },
      error: (err: any) => {
        this.processingPayment = false;
        this.orderMessage = 'Payment verification failed.';
        this.cdr.detectChanges();
      }
    });
  }

  simulatePaymentFailure() {
    this.showPaymentGateway = false;
    this.orderMessage = 'Payment failed. You can try again from your Orders page.';
    this.cartService.clearCart(); // Order was still created as PENDING, but cart is empty now
    this.cdr.detectChanges();
  }

  finalizeOrderSuccess(message: string) {
    this.orderSuccess = true;
    this.orderMessage = message;
    this.cartService.clearCart();
    this.cdr.detectChanges();
  }
}

