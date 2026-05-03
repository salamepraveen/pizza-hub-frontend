import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private pizzasCache$?: Observable<any>;
  private toppingsCache$?: Observable<any>;

  constructor(private api: ApiService) {}

  getAll() {
    if (!this.pizzasCache$) {
      this.pizzasCache$ = this.api.get('/pizzas').pipe(
        shareReplay(1)
      );
    }
    return this.pizzasCache$;
  }

  clearCache() {
    this.pizzasCache$ = undefined;
    this.toppingsCache$ = undefined;
  }

  getById(id: number) {
    return this.api.get('/pizzas/' + id);
  }

  search(keyword: string) {
    return this.api.get('/pizzas/search?keyword=' + keyword);
  }

  getVegetarian() {
    return this.api.get('/pizzas/vegetarian');
  }

  getToppings() {
    if (!this.toppingsCache$) {
      this.toppingsCache$ = this.api.get('/pizzas/toppings').pipe(
        shareReplay(1)
      );
    }
    return this.toppingsCache$;
  }

  createTopping(topping: any) {
    return this.api.post('/api-direct-pizza/pizzas/toppings', topping);
  }

  deleteTopping(id: number) {
    return this.api.delete('/api-direct-pizza/pizzas/toppings/' + id);
  }

  updateTopping(id: number, topping: any) {
    return this.api.put('/api-direct-pizza/pizzas/toppings/' + id, topping);
  }

  create(pizza: any) {
    return this.api.post('/api-direct-pizza/pizzas', pizza);
  }

  update(id: number, pizza: any) {
    return this.api.put('/api-direct-pizza/pizzas/' + id, pizza);
  }

  delete(id: number) {
    return this.api.delete('/api-direct-pizza/pizzas/' + id);
  }
}
