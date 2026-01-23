import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FailAnimationComponentPage } from './fail-animation-component.page';

describe('FailAnimationComponentPage', () => {
  let component: FailAnimationComponentPage;
  let fixture: ComponentFixture<FailAnimationComponentPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FailAnimationComponentPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
