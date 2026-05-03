import { TestBed } from '@angular/core/testing';
import { CartService } from './cartservice';

describe('CartService', () => {
  let service: CartService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CartService);
    // Clear session storage before each test
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initially have an empty cart', () => {
    expect(service.getItems().length).toBe(0);
    expect(service.getCartTotal()).toBe(0);
  });
});
