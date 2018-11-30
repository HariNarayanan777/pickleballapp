import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChatPage } from './chat';
import { PipesModule } from '../../pipes/pipes.module';
import { EmojiPickerComponentModule } from '../../components/emoji-picker/emoji-picker.module';

@NgModule({
  declarations: [
    ChatPage,
  ],
  imports: [
    IonicPageModule.forChild(ChatPage),
    EmojiPickerComponentModule,
    PipesModule
  ],
})
export class ChatPageModule {}
