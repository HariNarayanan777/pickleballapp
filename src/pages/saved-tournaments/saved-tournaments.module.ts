import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SavedTournamentsPage } from './saved-tournaments';

@NgModule({
  declarations: [
    SavedTournamentsPage,
  ],
  imports: [
    IonicPageModule.forChild(SavedTournamentsPage),
  ],
})
export class SavedTournamentsPageModule {}
