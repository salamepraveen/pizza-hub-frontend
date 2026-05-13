import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';


import { PizzaDetail } from './pizza-detail';
import { MenuService } from '../../../services/menuService/menu.service';
import { CartService } from '../../../services/cartservice/cartservice';

describe('PizzaDetail', () => {
  let component: PizzaDetail;
  let fixture: ComponentFixture<PizzaDetail>;
  let menuServiceSpy: any;
  let cartServiceSpy: any;
  let routerSpy: any;

  beforeEach(async () => {
    const mSpy = { getById: jasmine.createSpy(), getToppings: jasmine.createSpy() };
    const cSpy = { addItem: jasmine.createSpy() };
    const rSpy = { navigate: jasmine.createSpy() };

    await TestBed.configureTestingModule({
      imports: [PizzaDetail, FormsModule],
      providers: [
        { provide: MenuService, useValue: mSpy },
        { provide: CartService, useValue: cSpy },
        { provide: Router, useValue: rSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '1' } } }
        },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PizzaDetail);
    component = fixture.componentInstance;
    menuServiceSpy = TestBed.inject(MenuService);
    cartServiceSpy = TestBed.inject(CartService);
    routerSpy = TestBed.inject(Router);
    
    // Default mocks for ngOnInit
    menuServiceSpy.getById.and.returnValue(of({ success: true, data: { id: 1, name: 'Margherita', basePrice: 10, sizes: [{ size: 'MEDIUM', price: 2 }] } }));
    menuServiceSpy.getToppings.and.returnValue(of({ data: [{ id: 1, name: 'Cheese', price: 1, isAvailable: true }] }));
    
    fixture.detectChanges();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load pizza and toppings on init', () => {
    expect(component.pizza.name).toBe('Margherita');
    expect(component.selectedSize.size).toBe('MEDIUM');
    expect(component.pizza.toppings.length).toBe(1);
    expect(component.itemTotal).toBe(12); // (10 + 2 + 0) * 1
  });

  it('should handle pizza load error', () => {
    menuServiceSpy.getById.and.returnValue(throwError(() => new Error('Error')));
    component.loadPizza();
    expect(component.error).toBe('Failed to load pizza details');
  });

  it('should toggle topping and recalculate total', () => {
    const topping = { id: 1, name: 'Cheese', price: 2 };
    component.toggleTopping(topping);
    expect(component.selectedToppings.length).toBe(1);
    expect(component.itemTotal).toBe(14); // (10 + 2 + 2) * 1

    component.toggleTopping(topping);
    expect(component.selectedToppings.length).toBe(0);
    expect(component.itemTotal).toBe(12);
  });

  it('should change quantity', () => {
    component.changeQuantity(1);
    expect(component.quantity).toBe(2);
    expect(component.itemTotal).toBe(24); // 12 * 2

    component.changeQuantity(-1);
    expect(component.quantity).toBe(1);

    component.changeQuantity(-1); // should not go below 1
    expect(component.quantity).toBe(1);
  });

  it('should add to cart', () => {
    jasmine.clock().install();
    component.addToCart();
    expect(cartServiceSpy.addItem).toHaveBeenCalled();
    expect(component.addedToCart).toBe(true);

    jasmine.clock().tick(3000);
    expect(component.addedToCart).toBe(false);
  });

  it('should select size', () => {
    component.selectSize({ size: 'LARGE', price: 4 });
    expect(component.selectedSize.size).toBe('LARGE');
    expect(component.itemTotal).toBe(14); // 10 + 4
  });

  it('should navigate to cart', () => {
    component.goToCart();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/customer/cart']);
  });
});
