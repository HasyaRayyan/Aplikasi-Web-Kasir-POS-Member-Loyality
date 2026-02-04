import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddonPage } from './addon.page';

describe('AddonPage', () => {
  let component: AddonPage;
  let fixture: ComponentFixture<AddonPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddonPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
