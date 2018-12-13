import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ViewTournamentPage } from './view-tournament';

@NgModule({
  declarations: [
    ViewTournamentPage,
  ],
  imports: [
    IonicPageModule.forChild(ViewTournamentPage),
  ],
})
export class ViewTournamentPageModule {}
