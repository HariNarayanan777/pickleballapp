import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { MapPage } from '../map/map';
import { ViewEventPage } from '../view-event/view-event';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {


  constructor(public navCtrl: NavController) {

  }

  public toView(type) {
    this.navCtrl.push(ViewEventPage, { type });
  }

  goToMap() {
    this.navCtrl.push(MapPage);
  }

}
