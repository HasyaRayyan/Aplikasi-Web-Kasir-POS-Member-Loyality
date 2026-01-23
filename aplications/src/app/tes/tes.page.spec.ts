import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TesPage } from './tes.page';

describe('TesPage', () => {
  let component: TesPage;
  let fixture: ComponentFixture<TesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
