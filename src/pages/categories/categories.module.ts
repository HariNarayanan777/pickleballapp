import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CategoriesPage } from './categories';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    CategoriesPage,
  ],
  imports: [
    IonicPageModule.forChild(CategoriesPage),
    PipesModule
  ],
})
export class CategoriesPageModule {}
