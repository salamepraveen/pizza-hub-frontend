import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RestaurantService } from '../../../services/restaurant-service/restaurant.service';

@Component({
  selector: 'app-create-restaurant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-restaurant.html',
  styleUrls: ['./create-restaurant.css']
})
export class CreateRestaurant {
  restaurantName = '';
  loading = false;
  error = '';
  success = '';

  constructor(
    private restaurantService: RestaurantService,
    private router: Router
  ) {}

  onSubmit() {
    if (!this.restaurantName.trim()) {
      this.error = 'Restaurant name is required';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    this.restaurantService.createRestaurant(this.restaurantName).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.success = 'Restaurant created successfully! You are now an ADMIN. Please login again to refresh your permissions.';
        
        // After 3 seconds, force logout to refresh token and roles
        setTimeout(() => {
          sessionStorage.clear();
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to create restaurant. Please try again.';
      }
    });
  }
}

