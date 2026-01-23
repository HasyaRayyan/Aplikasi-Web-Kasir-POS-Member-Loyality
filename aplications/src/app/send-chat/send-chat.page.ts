import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-send-chat',
  templateUrl: './send-chat.page.html',
  styleUrls: ['./send-chat.page.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  standalone: true,
  imports: [CommonModule],
})
export class SendChatPage implements OnInit {
  selectedContacts: any[] = [];
  messages: { sender: string; text: string }[] = []; // Messages array
  newMessage: string = ''; // Input for the new message

  constructor(private router: Router) {}

  ngOnInit() {
    // Retrieve selected contacts from navigation state
    const navigation = this.router.getCurrentNavigation();
    this.selectedContacts = navigation?.extras?.state?.['contacts'] || [];
    console.log(this.selectedContacts);
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      // Add the new message to the messages array
      this.messages.push({ sender: 'me', text: this.newMessage });
      this.newMessage = ''; // Clear the input field
    } else {
      alert('Message cannot be empty!');
    }
  }
}
