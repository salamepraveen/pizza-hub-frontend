import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { UserService } from './user.service';
import { ApiService } from '../api.service';

describe('UserService', () => {
  let service: UserService;
  let apiServiceSpy: any;

  beforeEach(() => {
    const spy = { get: jasmine.createSpy(), post: jasmine.createSpy(), put: jasmine.createSpy() };
    
    TestBed.configureTestingModule({
      providers: [
        UserService,
        { provide: ApiService, useValue: spy }
      ]
    });
    service = TestBed.inject(UserService);
    apiServiceSpy = TestBed.inject(ApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should getProfile', () => {
    const mockResponse = { data: 'profile' };
    apiServiceSpy.get.and.returnValue(of(mockResponse));
    
    service.getProfile().subscribe(res => {
      expect(res).toEqual(mockResponse);
    });
    expect(apiServiceSpy.get).toHaveBeenCalledWith('/users/profile');
  });

  it('should updateProfile', () => {
    const mockData = { name: 'test' };
    const mockResponse = { data: 'updated' };
    apiServiceSpy.put.and.returnValue(of(mockResponse));
    
    service.updateProfile(mockData).subscribe(res => {
      expect(res).toEqual(mockResponse);
    });
    expect(apiServiceSpy.put).toHaveBeenCalledWith('/users/profile', mockData);
  });

  it('should createRestaurant', () => {
    const mockData = { name: 'test rest', city: 'test city', address: 'test address' };
    const mockResponse = { data: 'created' };
    apiServiceSpy.post.and.returnValue(of(mockResponse));
    
    service.createRestaurant(mockData).subscribe(res => {
      expect(res).toEqual(mockResponse);
    });
    expect(apiServiceSpy.post).toHaveBeenCalledWith('/users/restaurant', mockData);
  });

  it('should getMyRestaurants', () => {
    const mockResponse = { data: 'restaurants' };
    apiServiceSpy.get.and.returnValue(of(mockResponse));
    
    service.getMyRestaurants().subscribe(res => {
      expect(res).toEqual(mockResponse);
    });
    expect(apiServiceSpy.get).toHaveBeenCalledWith('/users/restaurants');
  });

  it('should getRestaurantUsers', () => {
    const mockResponse = { data: 'users' };
    apiServiceSpy.get.and.returnValue(of(mockResponse));
    
    service.getRestaurantUsers().subscribe(res => {
      expect(res).toEqual(mockResponse);
    });
    expect(apiServiceSpy.get).toHaveBeenCalledWith('/users/restaurant/users');
  });

  it('should promote', () => {
    const mockResponse = { data: 'promoted' };
    apiServiceSpy.put.and.returnValue(of(mockResponse));
    
    service.promote(1, 'MANAGER').subscribe(res => {
      expect(res).toEqual(mockResponse);
    });
    expect(apiServiceSpy.put).toHaveBeenCalledWith('/users/promote/1', { role: 'MANAGER' });
  });

  it('should demote', () => {
    const mockResponse = { data: 'demoted' };
    apiServiceSpy.put.and.returnValue(of(mockResponse));
    
    service.demote(1).subscribe(res => {
      expect(res).toEqual(mockResponse);
    });
    expect(apiServiceSpy.put).toHaveBeenCalledWith('/users/demote/1', {});
  });
});
