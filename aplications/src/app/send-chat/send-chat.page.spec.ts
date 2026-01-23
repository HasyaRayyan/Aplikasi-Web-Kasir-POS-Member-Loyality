import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SendChatPage } from './send-chat.page';

describe('SendChatPage', () => {
  let component: SendChatPage;
  let fixture: ComponentFixture<SendChatPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SendChatPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
