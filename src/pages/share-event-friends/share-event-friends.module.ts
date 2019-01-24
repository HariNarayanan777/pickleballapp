import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ShareEventFriendsPage } from './share-event-friends';

@NgModule({
  declarations: [
    ShareEventFriendsPage,
  ],
  imports: [
    IonicPageModule.forChild(ShareEventFriendsPage),
  ],
})
export class ShareEventFriendsPageModule {}
