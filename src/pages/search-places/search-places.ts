import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { LiveComunicationProvider } from '../../providers/live-comunication/live-comunication';

declare var google: any;

@IonicPage()
@Component({
  selector: 'page-search-places',
  templateUrl: 'search-places.html',
})
export class SearchPlacesPage {

  public search = "";
  private autocomplete: any;
  public map: any;
  public lat = 0;
  public lng = 0;

  public courst = [];
  public markers = [];

  constructor(
    public navCtrl: NavController, public navParams: NavParams,
    private geolocation: Geolocation
  ) {
  }

  async ionViewDidLoad() {
    let position = await this.geolocation.getCurrentPosition();
    await LiveComunicationProvider.reloadGoogleplaces();
    this.autocomplete = new google.maps.places.Autocomplete(document.querySelector("input.searchbar-input"));
    google.maps.event.addListener(this.autocomplete, 'place_changed', function () {
      var address = (document.querySelector("input.searchbar-input") as any).value;
      this.setLocationOfSearch(address);
    }.bind(this));
    this.initMap(position);
  }

  private async initMap(position) {

    this.lat = position.coords.latitude;
    this.lng = position.coords.longitude;
    let mapOptions: any = {
      center: {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      },
      zoom: 8
    };

    this.map = new google.maps.Map(document.getElementById("map_places"), mapOptions);

    google.maps.event.addListener(this.map, 'click', function (event) {
      this.lat = event.latLng.lat;
      this.lng = event.latLng.lng;
      let image = {
        url: './assets/imgs/icon-marker.png',
        // This marker is 20 pixels wide by 32 pixels high.
        size: new google.maps.Size(24, 24),
        // The origin for this image is (0, 0).
        origin: new google.maps.Point(0, 0),
        // The anchor for this image is the base of the flagpole at (0, 32).
        anchor: new google.maps.Point(0, 8)
      };

      new google.maps.Marker({
        animation: 'DROP',
        position: event.latLng,
        map: this.map,
        icon: image
      });
      this.map.setCenter({ lat: this.lat, lng: this.lng });
      this.getCourts();
    });

    this.getCourts();
  }

  private setLocationOfSearch(address: string) {
    let geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address }, function (res, status) {

      if (Object.prototype.toString.call(res) === "[object Array]") {
        if (res.length === 0) return;
        res = res[0];
      }
      console.log(res);

      if (res.geometry) {
        this.lat = res.geometry.location.lat();
        this.lng = res.geometry.location.lng();
        let image = {
          url: './assets/imgs/icon-marker.png',
          // This marker is 20 pixels wide by 32 pixels high.
          size: new google.maps.Size(24, 24),
          // The origin for this image is (0, 0).
          origin: new google.maps.Point(0, 0),
          // The anchor for this image is the base of the flagpole at (0, 32).
          anchor: new google.maps.Point(0, 8)
        };

        new google.maps.Marker({
          animation: 'DROP',
          position: {
            lat: this.lat,
            lng: this.lng
          },
          map: this.map,
          icon: image
        });

        this.map.setCenter({ lat: this.lat, lng: this.lng });
        this.getCourts();
      }

    }.bind(this));

  }

  private cleanMarkers() {
    for (var i = 0; i < this.markers.length; i++) {
      this.markers[i].setMap(null);
    }
    this.markers = [];
  }

  private getCourts() {
    this.courst = [];
    this.cleanMarkers();
    var defaultBounds = new google.maps.LatLng(this.lat, this.lng);
    var options = {
      location: defaultBounds,
      radius: 50000,
      name: 'pickleball courts',
      type: ['rv_park']
    };
    let service = new google.maps.places.PlacesService(this.map);

    service.nearbySearch(options, (results, status, pagination) => {
      console.log(results, status, pagination);
      pagination.nextPage();
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        for (let result of results) {
          this.courst.push({
            lat: result.geometry.location.lat(),
            lng: result.geometry.location.lng(),
            name: result.name,
            location: result.vicinity,
            photos: result.photos,
            rating: result.rating
          })

        }
        this.setMarkersOfPlaces(results)
      }
    });
  }

  private setMarkersOfPlaces(results) {
    for (let result of results) {
      let lat = result.geometry.location.lat();
      let lng = result.geometry.location.lng();
      let image = {
        url: './assets/imgs/icon-marker2.png',
        // This marker is 20 pixels wide by 32 pixels high.
        size: new google.maps.Size(24, 24),
        // The origin for this image is (0, 0).
        origin: new google.maps.Point(0, 0),
        // The anchor for this image is the base of the flagpole at (0, 32).
        anchor: new google.maps.Point(0, 8)
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
    }

  }

}
