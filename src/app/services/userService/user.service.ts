import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private api: ApiService) {}

  getProfile() {
    return this.api.get('/users/profile');
  }

  updateProfile(data: any) {
    return this.api.put('/users/profile', data);
  }

  createRestaurant(data: { name: string, city: string, address: string }) {
    return this.api.post('/users/restaurant', data);
  }

  getMyRestaurants() {
    return this.api.get('/users/restaurants');
  }

  getRestaurantUsers() {
    return this.api.get('/users/restaurant/users');
  }

  promote(userId: number, targetRole: string) {
    return this.api.put('/users/promote/' + userId, { role: targetRole });
  }

  demote(userId: number) {
    return this.api.put('/users/demote/' + userId, {});
  }
}
