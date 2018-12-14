import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ShareAppPage } from './share-app';

@NgModule({
  declarations: [
    ShareAppPage,
  ],
  imports: [
    IonicPageModule.forChild(ShareAppPage),
  ],
})
export class ShareAppPageModule {}
