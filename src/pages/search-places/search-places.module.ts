import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SearchPlacesPage } from './search-places';

@NgModule({
  declarations: [
    SearchPlacesPage,
  ],
  imports: [
    IonicPageModule.forChild(SearchPlacesPage),
  ],
})
export class SearchPlacesPageModule {}
