import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MemberPage } from './member.page';

describe('MemberPage', () => {
  let component: MemberPage;
  let fixture: ComponentFixture<MemberPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MemberPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
