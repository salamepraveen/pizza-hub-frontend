import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuService } from '../../../services/menuService/menu.service';
import { CartService, CartItem } from '../../../services/cartservice/cartservice';

@Component({
  selector: 'app-pizza-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pizza-detail.html',
  styleUrls:['./pizza-detail.css']
})
export class PizzaDetail implements OnInit {
  pizza: any = null;
  pizzaId = 0;
  loading = true;
  error = '';

  selectedSize: any = null;
  selectedToppings: any[] = [];
  quantity = 1;
  itemTotal = 0;
  toppingsTotal = 0;

  addedToCart = false;
  addMessage = '';

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private menuService: MenuService,
    private cartService: CartService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.pizzaId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.pizzaId) {
      this.loadPizza();
    } else {
      this.error = 'Invalid pizza ID';
      this.loading = false;
    }
  }

  loadPizza() {
    this.loading = true;
    this.menuService.getById(this.pizzaId).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.pizza = res.data;
          this.pizza = res.data;
          if (this.pizza.sizes && this.pizza.sizes.length > 0) {
            const medium = this.pizza.sizes.find((s: any) => s.size === 'MEDIUM');
            this.selectedSize = medium || this.pizza.sizes[0];
          } else {
            this.selectedSize = { size: 'REGULAR', price: 0 };
          }
          this.calculateTotal();
        } else {
          this.error = 'Pizza not found';
        }
        this.loading = false;
        this.cdr.detectChanges();
        // Load all available toppings for customization
        this.menuService.getToppings().subscribe({
          next: (topRes: any) => {
            const allToppings = topRes.data || topRes || [];
            // Override pizza.toppings with ALL available toppings from the restaurant
            this.pizza.toppings = allToppings.filter((t: any) => t.isAvailable !== false);
            this.cdr.detectChanges();
          }
        });
      },
      error: (err: any) => {
        this.error = 'Failed to load pizza details';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleTopping(topping: any) {
    const idx = this.selectedToppings.findIndex(t => t.id === topping.id);
    if (idx >= 0) {
      this.selectedToppings.splice(idx, 1);
    } else {
      this.selectedToppings.push(topping);
    }
    this.calculateTotal();
  }

  isToppingSelected(topping: any): boolean {
    return this.selectedToppings.some(t => t.id === topping.id);
  }

  selectSize(size: any) {
    this.selectedSize = size;
    this.calculateTotal();
  }

  calculateTotal() {
    if (!this.selectedSize || !this.pizza) return;
    const basePrice = this.pizza.basePrice || this.pizza.price || 0;
    this.toppingsTotal = this.selectedToppings.reduce((sum: number, t: any) => sum + (t.price || 0), 0);
    this.itemTotal = (basePrice + this.selectedSize.price + this.toppingsTotal) * this.quantity;
  }

  getBaseSizePrice(): number {
    if (!this.selectedSize || !this.pizza) return 0;
    const basePrice = this.pizza.basePrice || this.pizza.price || 0;
    return basePrice + this.selectedSize.price;
  }

  changeQuantity(delta: number) {
    const newQty = this.quantity + delta;
    if (newQty >= 1 && newQty <= 20) {
      this.quantity = newQty;
      this.calculateTotal();
    }
  }

  addToCart() {
    if (!this.pizza || !this.selectedSize) return;
    const cartItem: CartItem = {
      pizzaId: this.pizza.id,
      restaurantId: this.pizza.restaurantId || 1,
      name: this.pizza.name,
      imageUrl: this.pizza.imageUrl,
      vegetarian: this.pizza.vegetarian,
      size: this.selectedSize.size,
      basePrice: this.pizza.basePrice || this.pizza.price || 0,
      sizePrice: this.selectedSize.price,
      toppings: [...this.selectedToppings],
      quantity: this.quantity,
      itemTotal: this.itemTotal
    };
    this.cartService.addItem(cartItem);
    this.addedToCart = true;
    this.addMessage = this.pizza.name + ' (' + this.selectedSize.size + ') added to cart!';
    setTimeout(() => {
      this.addedToCart = false;
      this.addMessage = '';
    }, 3000);
  }

  goToCart() {
    this.router.navigate(['/customer/cart']);
  }

  getSizeLabel(size: string): string {
    const labels: any = { SMALL: 'S (8")', MEDIUM: 'M (10")', LARGE: 'L (12")', REGULAR: 'Regular' };
    return labels[size] || size;
  }

  getToppingCost(topping: any): string {
    return topping.price ? '+ ' + topping.price : 'Free';
  }
}
