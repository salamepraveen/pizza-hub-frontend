import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class PlatformAdminService {
  constructor(private api: ApiService) {}

  getAllUsers(): Observable<any> {
    return this.api.get('/users/all');
  }

  getAllRestaurants(): Observable<any> {
    return this.api.get('/users/admin/restaurants');
  }

  toggleBanUser(userId: number): Observable<any> {
    return this.api.put(`/users/ban/${userId}`, {});
  }

  toggleBanRestaurant(restaurantId: number): Observable<any> {
    return this.api.put(`/users/restaurant/ban/${restaurantId}`, {});
  }
}
