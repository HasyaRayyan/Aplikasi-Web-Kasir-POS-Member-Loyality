import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KasirDashboardPage } from './dashboard.page';

describe('KasirDashboardPage', () => {
  let component: KasirDashboardPage;
  let fixture: ComponentFixture<KasirDashboardPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(KasirDashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
