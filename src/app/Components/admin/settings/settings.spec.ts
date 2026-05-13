import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';

import { Settings } from './settings';
import { UserService } from '../../../services/userService/user.service';

describe('Settings', () => {
  let component: Settings;
  let fixture: ComponentFixture<Settings>;
  let uSpy: any;

  beforeEach(async () => {
    uSpy = {
      getMyRestaurants: jasmine.createSpy().and.returnValue(of({ data: { name: 'My Rest' } })),
      getProfile: jasmine.createSpy().and.returnValue(of({ data: { username: 'Admin' } })),
      updateProfile: jasmine.createSpy().and.returnValue(of({}))
    };

    await TestBed.configureTestingModule({
      imports: [Settings, FormsModule],
      providers: [
        { provide: UserService, useValue: uSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Settings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load data', () => {
    expect(component).toBeTruthy();
    expect(uSpy.getMyRestaurants).toHaveBeenCalled();
    expect(uSpy.getProfile).toHaveBeenCalled();
    expect(component.restaurantInfo.name).toBe('My Rest');
    expect(component.user.username).toBe('Admin');
  });

  it('should handle getProfile error', () => {
    uSpy.getProfile.and.returnValue(throwError(() => new Error('Err')));
    component.loadProfile();
    expect(component.error).toBe('Failed to load profile');
  });

  it('should toggle edit', () => {
    component.toggleEdit();
    expect(component.isEditing).toBe(true);
    component.toggleEdit();
    expect(component.isEditing).toBe(false);
  });

  it('should save profile', () => {
    component.saveProfile();
    expect(uSpy.updateProfile).toHaveBeenCalled();
    expect(component.message).toBe('Profile updated successfully!');
  });

  it('should handle save profile error', () => {
    uSpy.updateProfile.and.returnValue(throwError(() => ({ error: { message: 'Save error' } })));
    component.saveProfile();
    expect(component.error).toBe('Save error');
  });
});
