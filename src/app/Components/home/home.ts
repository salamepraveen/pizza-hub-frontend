import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MenuService } from '../../services/menuService/menu.service';
import { RestaurantService } from '../../services/restaurant-service/restaurant.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './home.html',
  styleUrls:['./home.css']
})
export class Home implements OnInit {
  isLoggedIn = false;
  userRole = '';
  
  // Pizza variables
  pizzas: any[] = [];
  filteredPizzas: any[] = [];
  trendingPizzas: any[] = [];
  restaurants: any[] = [];
  selectedRestaurant: any = null;
  viewMode: 'restaurants' | 'menu' = 'restaurants';

  searchQuery = '';
  loading = true;
  error = '';
  categories = [
    { name: 'All', active: true },
    { name: 'Veg', active: false },
    { name: 'Non-Veg', active: false }
  ];

  constructor(
    public router: Router,
    private menuService: MenuService,
    private restaurantService: RestaurantService
  ) {}

  ngOnInit() {
    this.isLoggedIn = !!sessionStorage.getItem('token');
    this.userRole = sessionStorage.getItem('role') || '';
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
      },
      error: (err: any) => {
        console.warn('Could not fetch restaurants from backend. Using fallback.', err);
        this.fallbackRestaurants();
        this.mapRestaurantNames();
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
      });
      // Re-slice trending to reflect updated names
      this.trendingPizzas = this.pizzas.slice(0, 4);
    }
  }

  loadPizzas() {
    this.loading = true;
    this.menuService.getAll().subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.pizzas = res.data;
        } else if (Array.isArray(res)) {
          this.pizzas = res;
        }
        this.trendingPizzas = this.pizzas.slice(0, 4);
        this.filteredPizzas = [...this.pizzas];
        this.mapRestaurantNames();
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Failed to load pizzas';
        this.loading = false;
      }
    });
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.loading = true;
      this.menuService.search(this.searchQuery).subscribe({
        next: (res: any) => {
          this.filteredPizzas = res.success ? (res.data || []) : (Array.isArray(res) ? res : []);
          this.loading = false;
        },
        error: () => {
          this.filteredPizzas = [];
          this.loading = false;
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
    this.selectedRestaurant = restaurant;
    this.viewMode = 'menu';
    this.searchQuery = '';
    // Reset category filter
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
    if (this.isLoggedIn) {
      this.router.navigate(['/customer/pizza', pizzaId]);
    } else {
      this.router.navigate(['/login']);
    }
  }

  getMinPrice(pizza: any): string {
    const base = pizza.basePrice || pizza.price || 0;
    if (pizza.sizes && pizza.sizes.length > 0) {
      const minSize = Math.min(...pizza.sizes.map((s: any) => s.price));
      return base + ' / ' + minSize;
    }
    return base + '';
  }

  getStarted() {
    if (this.isLoggedIn) {
      if (this.userRole === 'ADMIN') {
        this.router.navigate(['/admin/dashboard']);
      } else if (this.userRole === 'STAFF') {
        this.router.navigate(['/staff/dashboard']);
      } else {
        this.router.navigate(['/customer']);
      }
    } else {
      this.router.navigate(['/login']);
    }
  }

  logout() {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}

