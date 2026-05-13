import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MenuService } from '../../../services/menuService/menu.service';
import { RestaurantService } from '../../../services/restaurant-service/restaurant.service';

@Component({
  selector: 'app-customer-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-home.html',
  styleUrls: ['./customer-home.css']
})
export class CustomerHome implements OnInit {
  pizzas: any[] = [];
  filteredPizzas: any[] = [];
  restaurants: any[] = [];
  selectedRestaurant: any = null;
  viewMode: 'restaurants' | 'menu' = 'restaurants';
  searchQuery = '';
  loading = true;
  error = '';

  categories = [
    { name: 'All', icon: '', active: true },
    { name: 'Veg', icon: '', active: false },
    { name: 'Non-Veg', icon: '', active: false }
  ];

  getActiveCategory(): string {
    return this.categories.find(c => c.active)?.name || 'All';
  }

  trendingPizzas: any[] = [];

  constructor(
    private menuService: MenuService,
    public router: Router,
    private cdr: ChangeDetectorRef,
    private restaurantService: RestaurantService
  ) {}

  ngOnInit() {
    this.loadPizzas();
    this.loadRestaurants();
  }

  loadRestaurants() {
    this.restaurantService.getAllRestaurants().subscribe({
      next: (res: any) => {
        this.restaurants = res.success ? (res.data || []) : (Array.isArray(res) ? res : []);
        if (this.restaurants.length === 0) {
          this.fallbackRestaurants();
        }
        this.mapRestaurantNames();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.warn('Could not fetch restaurants from backend. Using fallback.', err);
        this.fallbackRestaurants();
        this.mapRestaurantNames();
        this.cdr.detectChanges();
      }
    });
  }

  fallbackRestaurants() {
    const uniqueIds = Array.from(new Set(this.pizzas.map(p => p.restaurantId).filter(id => id != null)));
    if (uniqueIds.length > 0) {
      this.restaurants = uniqueIds.map(id => ({
        id: id,
        name: 'PizzaHub Branch ' + id,
        city: 'Local Area',
        address: 'Main Street'
      }));
    } else {
      this.restaurants = [{ id: 1, name: 'PizzaHub Downtown', city: 'Mumbai', address: '123 Main Street' }];
    }
  }

  mapRestaurantNames() {
    if (this.pizzas.length > 0 && this.restaurants.length > 0) {
      this.pizzas.forEach(pizza => {
        const rest = this.restaurants.find(r => r.id === pizza.restaurantId);
        pizza.restaurantName = rest ? rest.name : 'Unknown Restaurant';
        pizza.restaurantBanned = rest ? rest.banned : false;
      });
      // Filter trending pizzas to only show from active restaurants
      this.trendingPizzas = this.pizzas
        .filter(p => !p.restaurantBanned)
        .slice(0, 6);
      this.cdr.detectChanges();
    }
  }

  loadPizzas() {
    this.loading = true;
    this.menuService.getAll().subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.pizzas = res.data.filter((p: any) => p.isAvailable !== false);
        }
        this.filteredPizzas = [...this.pizzas];
        this.mapRestaurantNames();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.error = 'Failed to load pizzas';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.loading = true;
      this.menuService.search(this.searchQuery).subscribe({
        next: (res: any) => {
          this.filteredPizzas = res.success ? (res.data || []).filter((p: any) => p.isAvailable !== false) : [];
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.filteredPizzas = [];
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.filteredPizzas = [...this.pizzas];
    }
  }

  filterByCategory(cat: any) {
    this.categories.forEach(c => c.active = false);
    cat.active = true;
    this.searchQuery = '';

    let basePizzas = this.selectedRestaurant 
      ? this.pizzas.filter(p => p.restaurantId === this.selectedRestaurant.id)
      : this.pizzas;

    if (cat.name === 'Veg') {
      this.filteredPizzas = basePizzas.filter(p => p.vegetarian);
    } else if (cat.name === 'Non-Veg') {
      this.filteredPizzas = basePizzas.filter(p => !p.vegetarian);
    } else {
      this.filteredPizzas = [...basePizzas];
    }
  }

  selectRestaurant(restaurant: any) {
    if (restaurant.banned) return;
    this.selectedRestaurant = restaurant;
    this.viewMode = 'menu';
    this.searchQuery = '';
    this.categories.forEach(c => c.active = (c.name === 'All'));
    this.filteredPizzas = this.pizzas.filter(p => p.restaurantId === restaurant.id);
  }

  backToRestaurants() {
    this.selectedRestaurant = null;
    this.viewMode = 'restaurants';
    this.searchQuery = '';
    this.categories.forEach(c => c.active = (c.name === 'All'));
    this.filteredPizzas = [...this.pizzas];
  }

  viewPizza(pizzaId: number) {
    this.router.navigate(['/customer/pizza', pizzaId]);
  }

  getMinPrice(pizza: any): string {
    const base = pizza.basePrice || pizza.price || 0;
    if (pizza.sizes && pizza.sizes.length > 0) {
      const minSize = Math.min(...pizza.sizes.map((s: any) => s.price));
      return base + ' / ' + minSize;
    }
    return base + '';
  }
}
