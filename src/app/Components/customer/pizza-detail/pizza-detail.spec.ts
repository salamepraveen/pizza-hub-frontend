import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { PizzaDetail } from './pizza-detail';

describe('PizzaDetail', () => {
  let component: PizzaDetail;
  let fixture: ComponentFixture<PizzaDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PizzaDetail],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(PizzaDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
