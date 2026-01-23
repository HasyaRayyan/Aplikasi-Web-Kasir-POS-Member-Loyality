import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SendChatPageRoutingModule } from './send-chat-routing.module';

import { SendChatPage } from './send-chat.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SendChatPageRoutingModule
  ],
})
export class SendChatPageModule {}
