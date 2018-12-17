import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import * as moment from 'moment';

declare var google;
@IonicPage()
@Component({
  selector: 'page-view-tournament',
  templateUrl: 'view-tournament.html',
})
export class ViewTournamentPage {

  public tournament: any = {};
  private map: any;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.tournament = this.navParams.get("tournament");
  }

  async ionViewDidLoad() {
    if (!this.tournament.latLng) return;

    let lat = this.tournament.latLng.lat;
    let lng = this.tournament.latLng.lng;
    let mapOptions: any = {
      center: {
        lat,
        lng
      },
      zoom: 12
    };

    this.map = new google.maps.Map(document.getElementById("map_tournament"), mapOptions);

    let image = {
      url: './assets/imgs/icon-marker-default.png',
      // This marker is 20 pixels wide by 32 pixels high.
      size: new google.maps.Size(30, 59),
      // The origin for this image is (0, 0).
      origin: new google.maps.Point(0, 0),
      // The anchor for this image is the base of the flagpole at (0, 32).
      anchor: new google.maps.Point(15, 59)
    };

    new google.maps.Marker({
      animation: 'DROP',
      position: {
        lat,
        lng
      },
      map: this.map,
      icon: image
    });

  }

  public dateToFormat(date) {
    return moment(date).format("ddd DD/MM/YYYY");
  }
}
