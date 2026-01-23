import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QrisModalPage } from './qris-modal.page';

describe('QrisModalPage', () => {
  let component: QrisModalPage;
  let fixture: ComponentFixture<QrisModalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(QrisModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
