import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PointPage } from './point.page';

describe('PointPage', () => {
  let component: PointPage;
  let fixture: ComponentFixture<PointPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PointPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
