import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MemberLayoutPage } from './member-layout.page';

describe('MemberLayoutPage', () => {
  let component: MemberLayoutPage;
  let fixture: ComponentFixture<MemberLayoutPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MemberLayoutPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
