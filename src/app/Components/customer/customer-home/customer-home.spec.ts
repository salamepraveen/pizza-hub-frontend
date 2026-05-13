import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { provideRouter, Router } from '@angular/router';

import { CustomerHome } from './customer-home';
import { MenuService } from '../../../services/menuService/menu.service';
import { RestaurantService } from '../../../services/restaurant-service/restaurant.service';

describe('CustomerHome', () => {
  let component: CustomerHome;
  let fixture: ComponentFixture<CustomerHome>;
  let routerSpy: any;
  let mSpy: any;
  let rSpy: any;

  const mockPizzas = [
    { id: 1, name: 'Margherita', vegetarian: true, restaurantId: 1, basePrice: 10, isAvailable: true, sizes: [{price: 2}] },
    { id: 2, name: 'Pepperoni', vegetarian: false, restaurantId: 2, price: 15, isAvailable: true }
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
      imports: [CustomerHome],
      providers: [
        provideRouter([]),
        { provide: MenuService, useValue: mSpy },
        { provide: RestaurantService, useValue: rSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerHome);
    component = fixture.componentInstance;
    routerSpy = TestBed.inject(Router);
    spyOn(routerSpy, 'navigate');
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
    
    component.searchQuery = '';
    component.onSearch();
    expect(component.filteredPizzas.length).toBe(2);
  });

  it('should handle search error', () => {
    component.searchQuery = 'Marg';
    mSpy.search.and.returnValue(throwError(() => new Error('Err')));
    component.onSearch();
    expect(component.filteredPizzas.length).toBe(0);
  });

  it('should filter by category', () => {
    expect(component.getActiveCategory()).toBe('All');
    component.filterByCategory({ name: 'Veg', active: false });
    expect(component.filteredPizzas.length).toBe(1);
    expect(component.filteredPizzas[0].name).toBe('Margherita');

    component.filterByCategory({ name: 'Non-Veg', active: false });
    expect(component.filteredPizzas.length).toBe(1);

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

  it('should navigate to view pizza', () => {
    component.viewPizza(1);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/customer/pizza', 1]);
  });

  it('should calculate min price', () => {
    expect(component.getMinPrice(mockPizzas[0])).toBe('10 / 2');
    expect(component.getMinPrice(mockPizzas[1])).toBe('15');
  });
});
