import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../../../services/cartservice/cartservice';
import { UserService } from '../../../services/userService/user.service';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive,FormsModule],
  templateUrl: './customer-layout.html',
  styleUrls:['./customer-layout.css']
})
export class CustomerLayout implements OnInit {
  username = '';
  role = '';
  cartCount = 0;
  mobileMenuOpen = false;
  showProfileModal = false;
  restaurantId = '';

  constructor(
    public router: Router,
    private cartService: CartService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.username = sessionStorage.getItem('username') || 'Guest';
    this.role = sessionStorage.getItem('role') || 'USER';
    this.restaurantId = sessionStorage.getItem('restaurantId') || '0';
    this.cartService.cart$.subscribe(items => {
      this.cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
    });
  }

  isUserRole(): boolean {
    return this.role === 'USER';
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  toggleProfileModal() {
    this.showProfileModal = !this.showProfileModal;
  }

  closeProfileModal() {
    this.showProfileModal = false;
  }

  logout() {
    sessionStorage.clear();
    this.cartService.clearCart();
    this.router.navigate(['/login']);
  }
}

