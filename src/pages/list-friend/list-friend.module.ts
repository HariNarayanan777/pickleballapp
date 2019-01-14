import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ListFriendPage } from './list-friend';

@NgModule({
  declarations: [
    ListFriendPage,
  ],
  imports: [
    IonicPageModule.forChild(ListFriendPage),
  ],
})
export class ListFriendPageModule {}
