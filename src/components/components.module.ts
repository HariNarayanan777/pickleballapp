import { NgModule } from '@angular/core';
import { UpdateAccountComponent } from './update-account/update-account';
import { IonicModule } from 'ionic-angular';
import { CommonModule } from '@angular/common';
import { FilterComponent } from './filter/filter';
@NgModule({
	declarations: [UpdateAccountComponent,
    FilterComponent],
	imports: [IonicModule, CommonModule],
	exports: [UpdateAccountComponent,
    FilterComponent]
})
export class ComponentsModule {}
