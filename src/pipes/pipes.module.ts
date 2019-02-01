import { NgModule } from '@angular/core';
import { RelativeTimePipe } from './relative-time/relative-time';
import { CDVPhotoLibraryPipe } from './cdv-photo-library/cdv-photo-library';
@NgModule({
	declarations: [RelativeTimePipe,
		CDVPhotoLibraryPipe],
	imports: [],
	exports: [RelativeTimePipe,
		CDVPhotoLibraryPipe]
})
export class PipesModule {}
