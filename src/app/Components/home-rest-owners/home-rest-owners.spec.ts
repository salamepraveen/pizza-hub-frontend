import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeRestOwners } from './home-rest-owners';

describe('HomeRestOwners', () => {
  let component: HomeRestOwners;
  let fixture: ComponentFixture<HomeRestOwners>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeRestOwners],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeRestOwners);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
