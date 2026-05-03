import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemAdmin } from './system-admin';

describe('SystemAdmin', () => {
  let component: SystemAdmin;
  let fixture: ComponentFixture<SystemAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemAdmin],
    }).compileComponents();

    fixture = TestBed.createComponent(SystemAdmin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
