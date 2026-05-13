import { TestBed } from '@angular/core/testing';
import { CartService, CartItem } from './cartservice';

describe('CartService', () => {
  let service: CartService;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(CartService);
  });

  const mockItem: CartItem = {
    pizzaId: 1,
    restaurantId: 1,
    name: 'Margherita',
    imageUrl: 'img.jpg',
    vegetarian: true,
    size: 'M',
    basePrice: 10,
    sizePrice: 2,
    toppings: [{ id: 1, price: 1 }],
    quantity: 1,
    itemTotal: 13
  };

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initially have an empty cart', () => {
    expect(service.getItems().length).toBe(0);
    expect(service.getCartTotal()).toBe(0);
  });

  it('should add item to cart', () => {
    service.addItem({ ...mockItem });
    expect(service.getItems().length).toBe(1);
    expect(service.getCartCount()).toBe(1);
    expect(service.getCartTotal()).toBe(13);
  });

  it('should increase quantity if adding same item', () => {
    service.addItem({ ...mockItem });
    service.addItem({ ...mockItem });
    expect(service.getItems().length).toBe(1);
    expect(service.getItems()[0].quantity).toBe(2);
    expect(service.getCartTotal()).toBe(26);
  });

  it('should add as new item if toppings or size differ', () => {
    service.addItem({ ...mockItem });
    service.addItem({ ...mockItem, size: 'L' });
    expect(service.getItems().length).toBe(2);
  });

  it('should remove item', () => {
    service.addItem({ ...mockItem });
    service.removeItem(0);
    expect(service.getItems().length).toBe(0);
  });

  it('should update quantity', () => {
    service.addItem({ ...mockItem });
    service.updateQuantity(0, 3);
    expect(service.getItems()[0].quantity).toBe(3);
    expect(service.getCartTotal()).toBe(39);
  });

  it('should remove item if quantity updated to 0', () => {
    service.addItem({ ...mockItem });
    service.updateQuantity(0, 0);
    expect(service.getItems().length).toBe(0);
  });

  it('should clear cart', () => {
    service.addItem({ ...mockItem });
    service.clearCart();
    expect(service.getItems().length).toBe(0);
  });

  it('should load cart from session storage on init', () => {
    sessionStorage.setItem('cart', JSON.stringify([mockItem]));
    const newService = new CartService();
    expect(newService.getItems().length).toBe(1);
  });
});
