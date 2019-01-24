import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SelectUsersPage } from './select-users';

@NgModule({
  declarations: [
    SelectUsersPage,
  ],
  imports: [
    IonicPageModule.forChild(SelectUsersPage),
  ],
})
export class SelectUsersPageModule {}
