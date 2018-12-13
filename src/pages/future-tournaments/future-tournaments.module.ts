import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FutureTournamentsPage } from './future-tournaments';

@NgModule({
  declarations: [
    FutureTournamentsPage,
  ],
  imports: [
    IonicPageModule.forChild(FutureTournamentsPage),
  ],
})
export class FutureTournamentsPageModule {}
