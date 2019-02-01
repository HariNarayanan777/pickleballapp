import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ItemDetailsPage } from './item-details';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    ItemDetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(ItemDetailsPage),
    PipesModule
  ],
})
export class ItemDetailsPageModule {}
