import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SuccessAnimationComponentPage } from './success-animation-component.page';

describe('SuccessAnimationComponentPage', () => {
  let component: SuccessAnimationComponentPage;
  let fixture: ComponentFixture<SuccessAnimationComponentPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SuccessAnimationComponentPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
