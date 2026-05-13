import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { MenuService } from './menu.service';
import { ApiService } from '../api.service';

describe('MenuService', () => {
  let service: MenuService;
  let apiServiceSpy: any;

  beforeEach(() => {
    const spy = { get: jasmine.createSpy(), post: jasmine.createSpy(), put: jasmine.createSpy(), delete: jasmine.createSpy() };

    TestBed.configureTestingModule({
      providers: [
        MenuService,
        { provide: ApiService, useValue: spy }
      ]
    });
    service = TestBed.inject(MenuService);
    apiServiceSpy = TestBed.inject(ApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all pizzas and cache them', () => {
    const mockPizzas = [{ id: 1, name: 'Margherita' }];
    apiServiceSpy.get.and.returnValue(of(mockPizzas));

    // First call
    service.getAll().subscribe(res => {
      expect(res).toEqual(mockPizzas);
    });
    expect(apiServiceSpy.get).toHaveBeenCalledWith('/pizzas');
    expect(apiServiceSpy.get).toHaveBeenCalledTimes(1);

    // Second call should use cache
    service.getAll().subscribe(res => {
      expect(res).toEqual(mockPizzas);
    });
    expect(apiServiceSpy.get).toHaveBeenCalledTimes(1); // Still 1
  });

  it('should get toppings and cache them', () => {
    const mockToppings = [{ id: 1, name: 'Cheese' }];
    apiServiceSpy.get.and.returnValue(of(mockToppings));

    service.getToppings().subscribe(res => {
      expect(res).toEqual(mockToppings);
    });
    expect(apiServiceSpy.get).toHaveBeenCalledWith('/pizzas/toppings');
    expect(apiServiceSpy.get).toHaveBeenCalledTimes(1);

    service.getToppings().subscribe(res => {
      expect(res).toEqual(mockToppings);
    });
    expect(apiServiceSpy.get).toHaveBeenCalledTimes(1);
  });

  it('should clear cache', () => {
    const mockData: any[] = [];
    apiServiceSpy.get.and.returnValue(of(mockData));

    service.getAll().subscribe();
    expect(apiServiceSpy.get).toHaveBeenCalledTimes(1);

    service.clearCache();

    service.getAll().subscribe();
    expect(apiServiceSpy.get).toHaveBeenCalledTimes(2);
  });

  it('should get by id', () => {
    const mockPizza = { id: 1, name: 'Margherita' };
    apiServiceSpy.get.and.returnValue(of(mockPizza));

    service.getById(1).subscribe(res => {
      expect(res).toEqual(mockPizza);
    });
    expect(apiServiceSpy.get).toHaveBeenCalledWith('/pizzas/1');
  });

  it('should search', () => {
    const mockPizzas = [{ id: 1, name: 'Margherita' }];
    apiServiceSpy.get.and.returnValue(of(mockPizzas));

    service.search('Marg').subscribe(res => {
      expect(res).toEqual(mockPizzas);
    });
    expect(apiServiceSpy.get).toHaveBeenCalledWith('/pizzas/search?keyword=Marg');
  });

  it('should get vegetarian', () => {
    const mockPizzas = [{ id: 1, name: 'Veggie' }];
    apiServiceSpy.get.and.returnValue(of(mockPizzas));

    service.getVegetarian().subscribe(res => {
      expect(res).toEqual(mockPizzas);
    });
    expect(apiServiceSpy.get).toHaveBeenCalledWith('/pizzas/vegetarian');
  });

  it('should create topping', () => {
    const newTopping = { name: 'Olives' };
    apiServiceSpy.post.and.returnValue(of(newTopping));

    service.createTopping(newTopping).subscribe(res => {
      expect(res).toEqual(newTopping);
    });
    expect(apiServiceSpy.post).toHaveBeenCalledWith('/api-direct-pizza/pizzas/toppings', newTopping);
  });

  it('should update topping', () => {
    const topping = { name: 'Black Olives' };
    apiServiceSpy.put.and.returnValue(of(topping));

    service.updateTopping(1, topping).subscribe(res => {
      expect(res).toEqual(topping);
    });
    expect(apiServiceSpy.put).toHaveBeenCalledWith('/api-direct-pizza/pizzas/toppings/1', topping);
  });

  it('should delete topping', () => {
    apiServiceSpy.delete.and.returnValue(of({}));

    service.deleteTopping(1).subscribe();
    expect(apiServiceSpy.delete).toHaveBeenCalledWith('/api-direct-pizza/pizzas/toppings/1');
  });

  it('should create pizza', () => {
    const newPizza = { name: 'Custom Pizza' };
    apiServiceSpy.post.and.returnValue(of(newPizza));

    service.create(newPizza).subscribe(res => {
      expect(res).toEqual(newPizza);
    });
    expect(apiServiceSpy.post).toHaveBeenCalledWith('/api-direct-pizza/pizzas', newPizza);
  });

  it('should update pizza', () => {
    const pizza = { name: 'Updated Pizza' };
    apiServiceSpy.put.and.returnValue(of(pizza));

    service.update(1, pizza).subscribe(res => {
      expect(res).toEqual(pizza);
    });
    expect(apiServiceSpy.put).toHaveBeenCalledWith('/api-direct-pizza/pizzas/1', pizza);
  });

  it('should delete pizza', () => {
    apiServiceSpy.delete.and.returnValue(of({}));

    service.delete(1).subscribe();
    expect(apiServiceSpy.delete).toHaveBeenCalledWith('/api-direct-pizza/pizzas/1');
  });
});
