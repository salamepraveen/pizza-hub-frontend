import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  pizzaId: number;
  restaurantId: number;
  name: string;
  imageUrl: string;
  vegetarian: boolean;
  size: string;
  basePrice: number;
  sizePrice: number;
  toppings: any[];
  quantity: number;
  itemTotal: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  cart$ = this.cartSubject.asObservable();

  constructor() {
    this.loadCart();
  }

  private loadCart() {
    const saved = sessionStorage.getItem('cart');
    if (saved) {
      this.cartItems = JSON.parse(saved);
      this.cartSubject.next(this.cartItems);
    }
  }

  private saveCart() {
    sessionStorage.setItem('cart', JSON.stringify(this.cartItems));
    this.cartSubject.next(this.cartItems);
  }

  addItem(item: CartItem) {
    const existing = this.cartItems.find(
      ci => ci.pizzaId === item.pizzaId &&
            ci.size === item.size &&
            JSON.stringify(ci.toppings.map(t => t.id)) === JSON.stringify(item.toppings.map(t => t.id))
    );
    if (existing) {
      existing.quantity += item.quantity;
      existing.itemTotal = (existing.basePrice + existing.sizePrice + existing.toppings.reduce((s: number, t: any) => s + (t.price || 0), 0)) * existing.quantity;
    } else {
      this.cartItems.push(item);
    }
    this.saveCart();
  }

  removeItem(index: number) {
    this.cartItems.splice(index, 1);
    this.saveCart();
  }

  updateQuantity(index: number, quantity: number) {
    if (quantity <= 0) {
      this.removeItem(index);
      return;
    }
    const item = this.cartItems[index];
    item.quantity = quantity;
    item.itemTotal = (item.basePrice + item.sizePrice + item.toppings.reduce((s: number, t: any) => s + (t.price || 0), 0)) * item.quantity;
    this.saveCart();
  }

  getCartTotal(): number {
    return this.cartItems.reduce((sum, item) => sum + item.itemTotal, 0);
  }

  getCartCount(): number {
    return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  clearCart() {
    this.cartItems = [];
    this.saveCart();
  }

  getItems(): CartItem[] {
    return this.cartItems;
  }
}

