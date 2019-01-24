import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { AuthProvider } from '../../providers/auth/auth';
import { LiveComunicationProvider } from '../../providers/live-comunication/live-comunication';

declare var google: any;
@IonicPage()
@Component({
  selector: 'page-select-point-map',
  templateUrl: 'select-point-map.html',
})
export class SelectPointMapPage {

  public courts = [];
  public markers = [];
  public marker: any = {};
  public map: any = {};
  public lat = 36.778259;
  public lng = -119.417931;
  public search = "";
  public userId = "";

  constructor(
    public navCtrl: NavController, public navParams: NavParams,
    public viewCtrl: ViewController
  ) {
    if (this.navParams.get("courts") !== undefined)
      this.courts = this.navParams.get("courts");

    setTimeout(this.initService.bind(this), 2000);
  }

  async initService() {
    await LiveComunicationProvider.reloadGoogleplaces();
    this.userId = await AuthProvider.me.getIdUser();
    let autocomplete = new google.maps.places.Autocomplete(document.querySelector("#search-courts-input .searchbar-input"));
    google.maps.event.addListener(autocomplete, 'place_changed', () => {
      var address = (document.querySelector("#search-courts-input .searchbar-input") as any).value;
      this.setLocationOfSearch(address);
    });
    await this.initMap();
  }

  private async initMap() {

    let mapOptions: any = {
      center: {
        lat: this.lat,
        lng: this.lng
      },
      zoom: 12
    };
    this.map = new google.maps.Map(document.getElementById("map_places"), mapOptions);
    this.marker = new google.maps.Marker({
      animation: 'DROP',
      position: {
        lat: this.lat,
        lng: this.lng
      },
      map: this.map,
      icon: {
        url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
      }
    });
    this.map.setCenter({ lat: this.lat, lng: this.lng });

    google.maps.event.addListener(this.map, 'click', event => {

      let lat = event.latLng.lat();
      let lng = event.latLng.lng();

      let image = {
        url: './assets/imgs/pickleball-icon.png',
        // This marker is 20 pixels wide by 32 pixels high.
        size: new google.maps.Size(20, 20),
        // The origin for this image is (0, 0).
        origin: new google.maps.Point(0, 0),
        // The anchor for this image is the base of the flagpole at (0, 32).
        anchor: new google.maps.Point(10, 10)
      };

      let marker = new google.maps.Marker({
        animation: 'DROP',
        position: {
          lat,
          lng
        },
        map: this.map,
        icon: image
      });
      this.markers.push(marker);
      this.addCourt({ lat, lng })
    });

  }

  private setLocationOfSearch(address: string) {
    let geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address }, function (res, status) {

      if (Object.prototype.toString.call(res) === "[object Array]") {
        if (res.length === 0) return;
        res = res[0];
      }

      if (res.geometry) {
        this.lat = res.geometry.location.lat();
        this.lng = res.geometry.location.lng();

        this.marker.setPosition({
          lat: this.lat,
          lng: this.lng
        });
        this.map.setCenter({ lat: this.lat, lng: this.lng });
      }

    }.bind(this));

  }

  private addCourt(latlng) {
    let geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'location': latlng }, (results, status) => {
      if (status === 'OK') {
        if (results[0]) {
          let court = {
            coordinates: latlng,
            address: results[0].formatted_address,
            user: this.userId
          };
          this.courts.push(court);
        }
      }
    });
  }

  public finish() {
    this.viewCtrl.dismiss(this.courts, "", { animation: "ios-transition" });
  }

}
