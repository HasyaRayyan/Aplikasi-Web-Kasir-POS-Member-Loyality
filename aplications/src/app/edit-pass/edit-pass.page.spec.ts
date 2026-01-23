import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditPassPage } from './edit-pass.page';

describe('EditPassPage', () => {
  let component: EditPassPage;
  let fixture: ComponentFixture<EditPassPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EditPassPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
