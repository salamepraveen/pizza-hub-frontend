import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';

import { StaffMgmt } from './staff-mgmt';
import { UserService } from '../../../services/userService/user.service';

describe('StaffMgmt', () => {
  let component: StaffMgmt;
  let fixture: ComponentFixture<StaffMgmt>;
  let uSpy: any;

  const mockUsers = [
    { id: 1, username: 'admin1', role: 'ADMIN' },
    { id: 2, username: 'staff1', role: 'STAFF' },
    { id: 3, username: 'user1', role: 'USER' }
  ];

  beforeEach(async () => {
    uSpy = {
      getRestaurantUsers: jasmine.createSpy().and.returnValue(of({ data: mockUsers })),
      promote: jasmine.createSpy().and.returnValue(of({})),
      demote: jasmine.createSpy().and.returnValue(of({}))
    };

    await TestBed.configureTestingModule({
      imports: [StaffMgmt],
      providers: [
        provideRouter([]),
        { provide: UserService, useValue: uSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StaffMgmt);
    component = fixture.componentInstance;
    
    spyOn(sessionStorage, 'getItem').and.returnValue('1');
    spyOn(window, 'confirm').and.returnValue(true);
    jasmine.clock().install();
    
    fixture.detectChanges();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should create and load users', () => {
    expect(component).toBeTruthy();
    expect(component.users.length).toBe(3);
    expect(component.getAdminCount()).toBe(1);
    expect(component.getStaffCount()).toBe(1);
    expect(component.getUserCount()).toBe(1);
  });

  it('should filter users by role', () => {
    component.selectedFilter = 'STAFF';
    expect(component.filteredUsers.length).toBe(1);
    expect(component.filteredUsers[0].username).toBe('staff1');
  });

  it('should search users', () => {
    component.searchQuery = 'admin';
    expect(component.filteredUsers.length).toBe(1);
  });

  it('should promote user', () => {
    component.openPromoteModal(mockUsers[2]);
    component.promoteRole = 'ADMIN';
    component.promoteUser();
    expect(uSpy.promote).toHaveBeenCalledWith(3, 'ADMIN');
    jasmine.clock().tick(3000);
    expect(component.success).toBe('');
  });

  it('should handle promote error', () => {
    component.openPromoteModal(mockUsers[2]);
    uSpy.promote.and.returnValue(throwError(() => ({ error: { message: 'Err' } })));
    component.promoteUser();
    expect(component.error).toBe('Err');
  });

  it('should demote user', () => {
    component.demoteUser(mockUsers[1]);
    expect(uSpy.demote).toHaveBeenCalledWith(2);
    jasmine.clock().tick(3000);
    expect(component.success).toBe('');
  });

  it('should get correct badge class', () => {
    expect(component.getRoleBadgeClass('ADMIN')).toBe('badge-admin');
    expect(component.getRoleBadgeClass('STAFF')).toBe('badge-staff');
    expect(component.getRoleBadgeClass('USER')).toBe('badge-user');
  });
});
