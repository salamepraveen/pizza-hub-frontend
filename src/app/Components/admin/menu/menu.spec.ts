import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';


import { Menu } from './menu';
import { MenuService } from '../../../services/menuService/menu.service';

describe('Admin Menu Component', () => {
  let component: Menu;
  let fixture: ComponentFixture<Menu>;
  let menuServiceSpy: any;

  beforeEach(async () => {
    const mSpy = {
      getAll: jasmine.createSpy(), getToppings: jasmine.createSpy(), create: jasmine.createSpy(), update: jasmine.createSpy(), delete: jasmine.createSpy(), clearCache: jasmine.createSpy(),
      createTopping: jasmine.createSpy(), deleteTopping: jasmine.createSpy(), updateTopping: jasmine.createSpy()
    };

    await TestBed.configureTestingModule({
      imports: [Menu, FormsModule],
      providers: [
        { provide: MenuService, useValue: mSpy },
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Menu);
    component = fixture.componentInstance;
    menuServiceSpy = TestBed.inject(MenuService);

    // Default mocks
    menuServiceSpy.getAll.and.returnValue(of({ data: [{ id: 1, name: 'Margherita', vegetarian: true, price: 10 }] }));
    menuServiceSpy.getToppings.and.returnValue(of({ data: [{ id: 1, name: 'Cheese', price: 2 }] }));
    
    // For delete confirmation
    spyOn(window, 'confirm').and.returnValue(true);

    fixture.detectChanges();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should create and load data on init', () => {
    expect(component).toBeTruthy();
    expect(component.pizzas.length).toBe(1);
    expect(component.toppings.length).toBe(1);
  });

  it('should filter pizzas by search query and veg toggle', () => {
    component.pizzas = [
      { id: 1, name: 'Margherita', vegetarian: true },
      { id: 2, name: 'Pepperoni', vegetarian: false },
      { id: 3, name: 'Veggie Supreme', vegetarian: true }
    ];

    component.searchQuery = 'margh';
    expect(component.filteredPizzas.length).toBe(1);
    expect(component.filteredPizzas[0].name).toBe('Margherita');

    component.searchQuery = '';
    component.vegOnly = true;
    expect(component.filteredPizzas.length).toBe(2);
  });

  it('should add pizza successfully', () => {
    jasmine.clock().install();
    component.openAddModal();
    component.newPizza.name = 'New Pizza';
    component.newPizza.price = 15;
    menuServiceSpy.create.and.returnValue(of({ success: true }));
    menuServiceSpy.getAll.and.returnValue(of({ data: [] }));

    component.addPizza();
    jasmine.clock().tick(3000); // clear success message

    expect(menuServiceSpy.create).toHaveBeenCalled();
    expect(component.showAddModal).toBe(false);
    expect(menuServiceSpy.clearCache).toHaveBeenCalled();
  });

  it('should update pizza successfully', () => {
    jasmine.clock().install();
    component.openEditModal({ id: 1, name: 'Old Pizza', price: 10 });
    component.editPizza.name = 'Updated Pizza';
    component.editPizza.price = 12;
    menuServiceSpy.update.and.returnValue(of({ success: true }));
    menuServiceSpy.getAll.and.returnValue(of({ data: [] }));

    component.updatePizza();
    jasmine.clock().tick(3000);

    expect(menuServiceSpy.update).toHaveBeenCalled();
    expect(component.showEditModal).toBe(false);
    expect(menuServiceSpy.clearCache).toHaveBeenCalled();
  });

  it('should delete pizza successfully', () => {
    jasmine.clock().install();
    menuServiceSpy.delete.and.returnValue(of({ success: true }));
    menuServiceSpy.getAll.and.returnValue(of({ data: [] }));

    component.deletePizza(1);
    jasmine.clock().tick(3000);

    expect(window.confirm).toHaveBeenCalled();
    expect(menuServiceSpy.delete).toHaveBeenCalledWith(1);
    expect(menuServiceSpy.clearCache).toHaveBeenCalled();
  });

  it('should toggle pizza availability', () => {
    jasmine.clock().install();
    const pizza = { id: 1, isAvailable: true };
    menuServiceSpy.update.and.returnValue(of({ success: true }));

    component.togglePizzaAvailability(pizza);
    jasmine.clock().tick(3000);

    expect(pizza.isAvailable).toBe(false);
    expect(menuServiceSpy.update).toHaveBeenCalled();
    expect(menuServiceSpy.clearCache).toHaveBeenCalled();
  });

  it('should add topping successfully', () => {
    jasmine.clock().install();
    component.openToppingModal();
    component.newTopping = { name: 'Olives', price: 2 };
    menuServiceSpy.createTopping.and.returnValue(of({ success: true }));
    menuServiceSpy.getToppings.and.returnValue(of({ data: [] }));

    component.addTopping();
    jasmine.clock().tick(3000);

    expect(menuServiceSpy.createTopping).toHaveBeenCalled();
    expect(component.showToppingModal).toBe(false);
  });

  it('should delete topping successfully', () => {
    jasmine.clock().install();
    menuServiceSpy.deleteTopping.and.returnValue(of({ success: true }));
    menuServiceSpy.getToppings.and.returnValue(of({ data: [] }));

    component.deleteTopping(1);
    jasmine.clock().tick(3000);

    expect(window.confirm).toHaveBeenCalled();
    expect(menuServiceSpy.deleteTopping).toHaveBeenCalledWith(1);
  });

  it('should toggle topping availability', () => {
    jasmine.clock().install();
    const topping = { id: 1, isAvailable: true };
    menuServiceSpy.updateTopping.and.returnValue(of({ success: true }));

    component.toggleToppingAvailability(topping);
    jasmine.clock().tick(3000);

    expect(topping.isAvailable).toBe(false);
    expect(menuServiceSpy.updateTopping).toHaveBeenCalled();
  });
});
