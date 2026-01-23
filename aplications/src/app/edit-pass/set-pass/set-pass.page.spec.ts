import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SetPassPage } from './set-pass.page';

describe('SetPassPage', () => {
  let component: SetPassPage;
  let fixture: ComponentFixture<SetPassPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SetPassPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
