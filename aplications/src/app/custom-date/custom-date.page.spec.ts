import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomDatePage } from './custom-date.page';

describe('CustomDatePage', () => {
  let component: CustomDatePage;
  let fixture: ComponentFixture<CustomDatePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomDatePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
