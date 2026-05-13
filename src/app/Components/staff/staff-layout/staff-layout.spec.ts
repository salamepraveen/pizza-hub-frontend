import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { StaffLayout } from './staff-layout';

describe('StaffLayout', () => {
  let component: StaffLayout;
  let fixture: ComponentFixture<StaffLayout>;
  let routerSpy: any;

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports: [StaffLayout],
      providers: [
        provideRouter([]),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StaffLayout);
    component = fixture.componentInstance;
    routerSpy = TestBed.inject(Router);
    spyOn(routerSpy, 'navigate');
    
    spyOn(sessionStorage, 'getItem').and.callFake((key) => {
      if (key === 'username') return 'TestStaff';
      return null;
    });
    spyOn(sessionStorage, 'clear');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle sidebar', () => {
    expect(component.sidebarOpen).toBe(true);
    component.toggleSidebar();
    expect(component.sidebarOpen).toBe(false);
  });

  it('should logout', () => {
    component.logout();
    expect(sessionStorage.clear).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should get username', () => {
    expect(component.getUsername()).toBe('TestStaff');
  });
});
