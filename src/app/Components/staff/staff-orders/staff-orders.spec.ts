import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { StaffOrders } from './staff-orders';

describe('StaffOrders', () => {
  let component: StaffOrders;
  let fixture: ComponentFixture<StaffOrders>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffOrders],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(StaffOrders);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
