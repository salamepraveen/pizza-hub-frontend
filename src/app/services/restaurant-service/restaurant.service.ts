import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';

@Injectable({ providedIn: 'root' })
export class RestaurantService {
  constructor(private api: ApiService) {}

  createRestaurant(name: string) {
    return this.api.post('/users/restaurant', { name: name });
  }

  getMyRestaurants() {
    return this.api.get('/users/restaurants');
  }

  getAllRestaurants() {
    return this.api.get('/users/public/restaurants');
  }
}
