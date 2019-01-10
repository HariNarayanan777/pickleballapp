import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NearCourtsAndTournamentsPage } from './near-courts-and-tournaments';

@NgModule({
  declarations: [
    NearCourtsAndTournamentsPage,
  ],
  imports: [
    IonicPageModule.forChild(NearCourtsAndTournamentsPage),
  ],
})
export class NearCourtsAndTournamentsPageModule {}
