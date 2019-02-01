import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LibraryImagesPage } from './library-images';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    LibraryImagesPage,
  ],
  imports: [
    IonicPageModule.forChild(LibraryImagesPage),
    PipesModule
  ],
})
export class LibraryImagesPageModule {}
