import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditMembershipPage } from './edit-membership.page';

describe('EditMembershipPage', () => {
  let component: EditMembershipPage;
  let fixture: ComponentFixture<EditMembershipPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EditMembershipPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
