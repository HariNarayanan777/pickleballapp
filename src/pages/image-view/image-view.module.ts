import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ImageViewPage } from './image-view';
import { AngularCropperjsModule } from 'angular-cropperjs';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    ImageViewPage,
  ],
  imports: [
    IonicPageModule.forChild(ImageViewPage),
    AngularCropperjsModule,
    PipesModule
  ],
})
export class ImageViewPageModule {}
