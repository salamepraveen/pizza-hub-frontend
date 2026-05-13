import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { RestaurantService } from './restaurant.service';
import { ApiService } from '../api.service';

describe('RestaurantService', () => {
  let service: RestaurantService;
  let apiServiceSpy: any;

  beforeEach(() => {
    const spy = { get: jasmine.createSpy(), post: jasmine.createSpy() };

    TestBed.configureTestingModule({
      providers: [
        RestaurantService,
        { provide: ApiService, useValue: spy }
      ]
    });
    service = TestBed.inject(RestaurantService);
    apiServiceSpy = TestBed.inject(ApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should createRestaurant', () => {
    const mockResponse = { data: 'created' };
    apiServiceSpy.post.and.returnValue(of(mockResponse));
    
    service.createRestaurant('Test Restaurant').subscribe(res => {
      expect(res).toEqual(mockResponse);
    });
    expect(apiServiceSpy.post).toHaveBeenCalledWith('/users/restaurant', { name: 'Test Restaurant' });
  });

  it('should getMyRestaurants', () => {
    const mockResponse = { data: 'my-restaurants' };
    apiServiceSpy.get.and.returnValue(of(mockResponse));
    
    service.getMyRestaurants().subscribe(res => {
      expect(res).toEqual(mockResponse);
    });
    expect(apiServiceSpy.get).toHaveBeenCalledWith('/users/restaurants');
  });

  it('should getAllRestaurants', () => {
    const mockResponse = { data: 'all-restaurants' };
    apiServiceSpy.get.and.returnValue(of(mockResponse));
    
    service.getAllRestaurants().subscribe(res => {
      expect(res).toEqual(mockResponse);
    });
    expect(apiServiceSpy.get).toHaveBeenCalledWith('/users/public/restaurants');
  });
});
