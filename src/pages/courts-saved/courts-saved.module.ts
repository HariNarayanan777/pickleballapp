import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CourtsSavedPage } from './courts-saved';

@NgModule({
  declarations: [
    CourtsSavedPage,
  ],
  imports: [
    IonicPageModule.forChild(CourtsSavedPage),
  ],
})
export class CourtsSavedPageModule {}
