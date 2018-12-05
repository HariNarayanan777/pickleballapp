import { NgModule } from '@angular/core';
import { UpdateAccountComponent } from './update-account/update-account';
import { IonicModule } from 'ionic-angular';
import { CommonModule } from '@angular/common';
@NgModule({
	declarations: [UpdateAccountComponent],
	imports: [IonicModule, CommonModule],
	exports: [UpdateAccountComponent]
})
export class ComponentsModule {}
