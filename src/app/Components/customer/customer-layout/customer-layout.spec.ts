import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, BehaviorSubject } from 'rxjs';

import { CustomerLayout } from './customer-layout';
import { CartService } from '../../../services/cartservice/cartservice';
import { UserService } from '../../../services/userService/user.service';

describe('CustomerLayout', () => {
  let component: CustomerLayout;
  let fixture: ComponentFixture<CustomerLayout>;
  let routerSpy: any;
  let mockCartItems$ = new BehaviorSubject<any[]>([{ quantity: 2 }]);

  beforeEach(async () => {
    const cSpy = { cart$: mockCartItems$.asObservable(), clearCart: jasmine.createSpy() };
    const uSpy = {};

    await TestBed.configureTestingModule({
      imports: [CustomerLayout],
      providers: [
        provideRouter([]),
        { provide: CartService, useValue: cSpy },
        { provide: UserService, useValue: uSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerLayout);
    component = fixture.componentInstance;
    routerSpy = TestBed.inject(Router);
    spyOn(routerSpy, 'navigate');
    
    spyOn(sessionStorage, 'getItem').and.callFake((key) => {
      if (key === 'username') return 'TestUser';
      if (key === 'role') return 'USER';
      if (key === 'restaurantId') return '1';
      return null;
    });
    spyOn(sessionStorage, 'clear');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should init and calculate cart count', () => {
    expect(component.username).toBe('TestUser');
    expect(component.role).toBe('USER');
    expect(component.restaurantId).toBe('1');
    expect(component.cartCount).toBe(2);
  });

  it('should check if user role', () => {
    expect(component.isUserRole()).toBe(true);
    component.role = 'ADMIN';
    expect(component.isUserRole()).toBe(false);
  });

  it('should toggle mobile menu', () => {
    expect(component.mobileMenuOpen).toBe(false);
    component.toggleMobileMenu();
    expect(component.mobileMenuOpen).toBe(true);
  });

  it('should toggle profile modal', () => {
    expect(component.showProfileModal).toBe(false);
    component.toggleProfileModal();
    expect(component.showProfileModal).toBe(true);
    component.closeProfileModal();
    expect(component.showProfileModal).toBe(false);
  });

  it('should logout', () => {
    const cartServiceSpy = TestBed.inject(CartService) as any;
    component.logout();
    expect(sessionStorage.clear).toHaveBeenCalled();
    expect(cartServiceSpy.clearCart).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});
