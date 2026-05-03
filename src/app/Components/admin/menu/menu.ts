import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuService } from '../../../services/menuService/menu.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menu.html',
  styleUrl: './menu.css'
})
export class Menu implements OnInit {
  pizzas: any[] = [];
  toppings: any[] = [];
  error = '';
  success = '';
  loading = true;

  // Search & Filter
  searchQuery = '';
  vegOnly = false;

  // Add Pizza Modal
  showAddModal = false;
  newPizza: any = {
    name: '',
    description: '',
    price: 0,
    vegetarian: false,
    imageUrl: '',
    available: true,
    toppingIds: [],
    sizes: [
      { size: 'SMALL', price: 0 },
      { size: 'MEDIUM', price: 0 },
      { size: 'LARGE', price: 0 }
    ]
  };

  // Edit Pizza Modal
  showEditModal = false;
  editPizza: any = {};

  // View Pizza Modal
  showViewModal = false;
  viewPizza: any = null;

  // Topping Modal
  showToppingModal = false;
  newTopping = { name: '', price: 0 };

  constructor(
    public router: Router,
    private menuService: MenuService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadPizzas();
    this.loadToppings();
  }

  get filteredPizzas(): any[] {
    let result = [...this.pizzas];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }

    if (this.vegOnly) {
      result = result.filter(p => p.vegetarian === true);
    }

    return result;
  }

  onSearch() {
    // filteredPizzas getter handles this
  }

  onVegToggle() {
    // filteredPizzas getter handles this
  }

  loadPizzas() {
    this.loading = true;
    this.menuService.getAll().subscribe({
      next: (res: any) => {
        this.pizzas = res.data || res || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Failed to load pizzas';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadToppings() {
    this.menuService.getToppings().subscribe({
      next: (res: any) => {
        this.toppings = res.data || res || [];
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Failed to load toppings';
        this.cdr.detectChanges();
      }
    });
  }

  // ===== ADD PIZZA MODAL =====

  openAddModal() {
    this.newPizza = {
      name: '',
      description: '',
      price: 0,
      vegetarian: false,
      imageUrl: '',
      available: true,
      toppingIds: [],
      sizes: [
        { size: 'SMALL', price: 0 },
        { size: 'MEDIUM', price: 0 },
        { size: 'LARGE', price: 0 }
      ]
    };
    this.error = '';
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
  }

  isToppingSelected(toppingId: number): boolean {
    return (this.newPizza.toppingIds || []).includes(toppingId);
  }

  toggleToppingSelection(toppingId: number) {
    if (!this.newPizza.toppingIds) {
      this.newPizza.toppingIds = [];
    }
    const idx = this.newPizza.toppingIds.indexOf(toppingId);
    if (idx === -1) {
      this.newPizza.toppingIds.push(toppingId);
    } else {
      this.newPizza.toppingIds.splice(idx, 1);
    }
  }

  addPizza() {
    if (!this.newPizza.name.trim()) {
      this.error = 'Pizza name is required';
      return;
    }
    if (this.newPizza.price <= 0) {
      this.error = 'Price must be greater than 0';
      return;
    }

    // Filter out sizes with 0 price
    const payload = { ...this.newPizza };
    payload.sizes = payload.sizes.filter((s: any) => s.price > 0);

    this.error = '';
    this.menuService.create(payload).subscribe({
      next: (res: any) => {
        this.success = 'Pizza added successfully';
        this.showAddModal = false;
        this.menuService.clearCache();
        this.loadPizzas();
        this.cdr.detectChanges();
        setTimeout(() => { this.success = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Failed to add pizza';
        this.cdr.detectChanges();
      }
    });
  }

  // ===== EDIT PIZZA MODAL =====

  openEditModal(pizza: any) {
    this.editPizza = {
      id: pizza.id,
      name: pizza.name,
      description: pizza.description || '',
      price: pizza.basePrice || pizza.price || 0,
      vegetarian: pizza.vegetarian,
      imageUrl: pizza.imageUrl || '',
      available: pizza.available !== false,
      toppingIds: pizza.toppings ? pizza.toppings.map((t: any) => t.id) : [],
      sizes: [
        { size: 'SMALL', price: pizza.sizes?.find((s:any) => s.size === 'SMALL')?.price || 0 },
        { size: 'MEDIUM', price: pizza.sizes?.find((s:any) => s.size === 'MEDIUM')?.price || 0 },
        { size: 'LARGE', price: pizza.sizes?.find((s:any) => s.size === 'LARGE')?.price || 0 }
      ]
    };
    this.error = '';
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
  }

  updatePizza() {
    if (!this.editPizza.name.trim()) {
      this.error = 'Pizza name is required';
      return;
    }
    if (this.editPizza.price <= 0) {
      this.error = 'Price must be greater than 0';
      return;
    }

    const payload = { ...this.editPizza };
    payload.sizes = payload.sizes.filter((s: any) => s.price > 0);

    this.error = '';
    this.menuService.update(this.editPizza.id, payload).subscribe({
      next: (res: any) => {
        this.success = 'Pizza updated successfully';
        this.showEditModal = false;
        this.menuService.clearCache();
        this.loadPizzas();
        this.cdr.detectChanges();
        setTimeout(() => { this.success = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Failed to update pizza';
        this.cdr.detectChanges();
      }
    });
  }

  // ===== VIEW PIZZA MODAL =====

  viewPizzaDetail(pizza: any) {
    this.viewPizza = pizza;
    this.showViewModal = true;
  }

  closeViewModal() {
    this.showViewModal = false;
    this.viewPizza = null;
  }

  // ===== DELETE PIZZA =====

  deletePizza(id: number) {
    if (confirm('Are you sure you want to delete this pizza?')) {
      this.menuService.delete(id).subscribe({
        next: (res: any) => {
          this.success = 'Pizza deleted successfully';
          this.menuService.clearCache();
          this.loadPizzas();
          this.cdr.detectChanges();
          setTimeout(() => { this.success = ''; this.cdr.detectChanges(); }, 3000);
        },
        error: (err: any) => {
          this.error = err.error?.message || 'Failed to delete pizza';
          this.cdr.detectChanges();
        }
      });
    }
  }

  // ===== TOGGLE AVAILABILITY =====

  togglePizzaAvailability(pizza: any) {
    const originalStatus = pizza.isAvailable;
    pizza.isAvailable = !originalStatus; // Optimistic update
    
    // We send back the whole pizza but with the new isAvailable state
    const payload = { ...pizza, sizes: pizza.sizes?.filter((s:any) => s.price > 0) || [] };
    
    this.menuService.update(pizza.id, payload).subscribe({
      next: () => {
        this.success = `Pizza marked as ${pizza.isAvailable ? 'Available' : 'Out of Stock'}`;
        this.menuService.clearCache();
        this.cdr.detectChanges();
        setTimeout(() => { this.success = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: (err: any) => {
        pizza.isAvailable = originalStatus; // Revert on error
        this.error = err.error?.message || 'Failed to update availability';
        this.cdr.detectChanges();
      }
    });
  }

  // ===== TOPPING MODAL =====

  openToppingModal() {
    this.newTopping = { name: '', price: 0 };
    this.error = '';
    this.showToppingModal = true;
  }

  closeToppingModal() {
    this.showToppingModal = false;
  }

  addTopping() {
    if (!this.newTopping.name.trim()) {
      this.error = 'Topping name is required';
      return;
    }
    if (this.newTopping.price <= 0) {
      this.error = 'Topping price must be greater than 0';
      return;
    }

    this.error = '';
    this.menuService.createTopping(this.newTopping).subscribe({
      next: (res: any) => {
        this.success = 'Topping added successfully';
        this.showToppingModal = false;
        this.menuService.clearCache();
        this.loadToppings();
        this.cdr.detectChanges();
        setTimeout(() => { this.success = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Failed to add topping';
        this.cdr.detectChanges();
      }
    });
  }

  deleteTopping(id: number) {
    if (confirm('Are you sure you want to delete this topping?')) {
      this.menuService.deleteTopping(id).subscribe({
        next: (res: any) => {
          this.success = 'Topping deleted successfully';
          this.menuService.clearCache();
          this.loadToppings();
          this.cdr.detectChanges();
          setTimeout(() => { this.success = ''; this.cdr.detectChanges(); }, 3000);
        },
        error: (err: any) => {
          this.error = err.error?.message || 'Failed to delete topping';
          this.cdr.detectChanges();
        }
      });
    }
  }

  toggleToppingAvailability(topping: any) {
    const originalStatus = topping.isAvailable;
    topping.isAvailable = !originalStatus; // Optimistic update
    
    this.menuService.updateTopping(topping.id, topping).subscribe({
      next: () => {
        this.success = `Topping marked as ${topping.isAvailable ? 'Available' : 'Out of Stock'}`;
        this.menuService.clearCache();
        this.cdr.detectChanges();
        setTimeout(() => { this.success = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: (err: any) => {
        topping.isAvailable = originalStatus; // Revert on error
        this.error = err.error?.message || 'Failed to update topping availability';
        this.cdr.detectChanges();
      }
    });
  }
}
