import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { Home } from './home';
import { MenuService } from '../../services/menuService/menu.service';
import { RestaurantService } from '../../services/restaurant-service/restaurant.service';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  let routerSpy: any;
  let mSpy: any;
  let rSpy: any;

  const mockPizzas = [
    { id: 1, name: 'Margherita', vegetarian: true, restaurantId: 1, basePrice: 10, sizes: [{price: 2}] },
    { id: 2, name: 'Pepperoni', vegetarian: false, restaurantId: 2, price: 15 }
  ];

  const mockRestaurants = [
    { id: 1, name: 'PizzaHub 1' },
    { id: 2, name: 'PizzaHub 2' }
  ];

  beforeEach(async () => {
    mSpy = { 
      getAll: jasmine.createSpy().and.returnValue(of({ success: true, data: mockPizzas })),
      search: jasmine.createSpy().and.returnValue(of({ success: true, data: [mockPizzas[0]] }))
    };
    rSpy = {
      getAllRestaurants: jasmine.createSpy().and.returnValue(of({ success: true, data: mockRestaurants }))
    };

    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideRouter([]),
        { provide: MenuService, useValue: mSpy },
        { provide: RestaurantService, useValue: rSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    routerSpy = TestBed.inject(Router);
    spyOn(routerSpy, 'navigate');
    
    spyOn(sessionStorage, 'getItem').and.callFake((key) => {
      if (key === 'token') return 'mock-token';
      if (key === 'role') return 'ADMIN';
      return null;
    });
    spyOn(sessionStorage, 'clear');

    fixture.detectChanges();
  });

  it('should create and load data', () => {
    expect(component).toBeTruthy();
    expect(component.pizzas.length).toBe(2);
    expect(component.restaurants.length).toBe(2);
    expect(component.filteredPizzas.length).toBe(2);
    expect(component.pizzas[0].restaurantName).toBe('PizzaHub 1');
  });

  it('should fallback restaurants on error', () => {
    rSpy.getAllRestaurants.and.returnValue(throwError(() => new Error('API Error')));
    component.loadRestaurants();
    expect(component.restaurants.length).toBeGreaterThan(0);
    expect(component.restaurants[0].name).toContain('PizzaHub');
  });

  it('should fallback pizzas on error', () => {
    mSpy.getAll.and.returnValue(throwError(() => new Error('API Error')));
    component.loadPizzas();
    expect(component.error).toBe('Failed to load pizzas');
  });

  it('should handle search', () => {
    component.searchQuery = 'Marg';
    component.onSearch();
    expect(mSpy.search).toHaveBeenCalledWith('Marg');
    expect(component.filteredPizzas.length).toBe(1);
    
    // empty search
    component.searchQuery = '';
    component.onSearch();
    expect(component.filteredPizzas.length).toBe(2);
  });

  it('should filter by category', () => {
    component.filterByCategory({ name: 'Veg', active: false });
    expect(component.filteredPizzas.length).toBe(1);
    expect(component.filteredPizzas[0].name).toBe('Margherita');

    component.filterByCategory({ name: 'Non-Veg', active: false });
    expect(component.filteredPizzas.length).toBe(1);
    expect(component.filteredPizzas[0].name).toBe('Pepperoni');

    component.filterByCategory({ name: 'All', active: false });
    expect(component.filteredPizzas.length).toBe(2);
  });

  it('should select restaurant', () => {
    component.selectRestaurant(mockRestaurants[0]);
    expect(component.viewMode).toBe('menu');
    expect(component.filteredPizzas.length).toBe(1);
    
    component.backToRestaurants();
    expect(component.viewMode).toBe('restaurants');
    expect(component.filteredPizzas.length).toBe(2);
  });

  it('should navigate to view pizza if logged in', () => {
    component.isLoggedIn = true;
    component.viewPizza(1);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/customer/pizza', 1]);
  });

  it('should calculate min price', () => {
    expect(component.getMinPrice(mockPizzas[0])).toBe('10 / 2');
    expect(component.getMinPrice(mockPizzas[1])).toBe('15');
  });

  it('should navigate on getStarted', () => {
    component.isLoggedIn = true;
    component.userRole = 'ADMIN';
    component.getStarted();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin/dashboard']);

    component.userRole = 'STAFF';
    component.getStarted();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/staff/dashboard']);

    component.userRole = 'USER';
    component.getStarted();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/customer']);

    component.isLoggedIn = false;
    component.getStarted();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should logout', () => {
    component.logout();
    expect(sessionStorage.clear).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});
