import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { FormControl } from '@angular/forms';
import { LiveComunicationProvider } from '../../providers/live-comunication/live-comunication';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { HttpClient } from '@angular/common/http';
import { ViewCourtPage } from '../view-court/view-court';
import { AuthProvider } from '../../providers/auth/auth';

declare var google: any;

@IonicPage()
@Component({
  selector: 'page-view-event',
  templateUrl: 'view-event.html',
})
export class ViewEventPage {

  public _viewMap = false;
  public type = "";
  public items = [];

  //Para busquedad de torneos
  public torneoName = "";
  public tournaments = [];

  //Para busquedad de jugadores
  searching: any = false;
  shouldShowCancel: any = false;
  searchTerm: string = '';
  searchControl: FormControl;
  public players: any = [];
  userID: any;
  disable: boolean = false;

  //Para busquedad de courts
  public search = "";
  private autocomplete: any;
  public map: any;
  public lat = 36.778259;
  public lng = -119.417931;
  marker: any;

  public courst = [];
  public courstSaved = [];
  public courstSaveds = [];
  public markers = [];


  constructor(public navCtrl: NavController, public navParams: NavParams,
    public viewCtrl: ViewController, public http: HttpClient
  ) {
    this.type = this.navParams.get("type");
  }

  ionViewDidLoad() {
    // document.querySelector(".back-button").setAttribute("hidden", "");
  }

  async ngAfterViewInit() {
    document.querySelector(".back-button").setAttribute("hidden", "");
    await LiveComunicationProvider.reloadGoogleplaces();
    await this.initMap();

    // this.autocomplete = new google.maps.places.Autocomplete(document.querySelector("#search-courts-input .searchbar-input"));
    // google.maps.event.addListener(this.autocomplete, 'place_changed', function () {
    //   var address = (document.querySelector("#search-courts-input .searchbar-input") as any).value;
    //   this.setLocationOfSearch(address);
    // }.bind(this));

    await this.getCourtsSaved();

    let position = await HelpersProvider.me.getMyPosition();
    // console.log("MyPosition", position);
    this.setPosition(position, false);

  }

  public viewMap() {
    this._viewMap = !this._viewMap;
  }

  public getBanner() {
    if (this.type === "courts")
      return `url(./assets/imgs/pickleball-doubles.jpg)`;
  }

  public changeSearch() {

  }

  //#region para obtener los courts
  private async initMap() {

    let mapOptions: any = {
      center: {
        lat: this.lat,
        lng: this.lng
      },
      zoom: 12
    };
    this.map = new google.maps.Map(document.getElementById("map_place_event"), mapOptions);
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
      // console.log(event);
      this.lat = event.latLng.lat();
      this.lng = event.latLng.lng();

      this.marker.setPosition({
        lat: this.lat,
        lng: this.lng
      });
      this.map.setCenter({ lat: this.lat, lng: this.lng });
      this.getCourts();
      this.getTournaments(this.lat, this.lng);
    });

    this.getCourts();
  }

  private async setPosition(position, getCourts: boolean) {
    console.log(position);
    this.lat = position.coords.latitude;
    this.lng = position.coords.longitude;
    this.marker.setPosition({
      lat: this.lat,
      lng: this.lng
    });
    if (getCourts === true) {
      console.log("after set position!!");
      this.map.setCenter({ lat: this.lat, lng: this.lng });
      await this.getCourts();
      await this.getTournaments(this.lat, this.lng);
      console.log("set position!!");
    }
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
        this.getCourts();
        this.getTournaments(this.lat, this.lng);
      }

    }.bind(this));

  }

  private cleanMarkers() {
    for (var i = 0; i < this.markers.length; i++) {
      this.markers[i].setMap(null);
    }
    this.markers = [];
  }

  private async getCourts() {
    this.courst = [];
    this.cleanMarkers();
    let defaultBounds = new google.maps.LatLng(this.lat, this.lng);
    let options: any = {
      location: defaultBounds,
      radius: 50000,
      fields: ['photos', 'formatted_address', 'name', 'rating', 'opening_hours', 'geometry', 'price_level']
    };
    options.name = 'pickleball courts';


    let service = new google.maps.places.PlacesService(this.map);

    let results = await new Promise((resolve, reject) => {
      service.nearbySearch(options, (results, status, pagination) => {
        // console.log(results, status, pagination);
        pagination.nextPage();
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          for (let result of results) {
            this.courst.push({
              lat: result.geometry.location.lat(),
              lng: result.geometry.location.lng(),
              name: result.name,
              location: result.vicinity,
              photos: result.photos ? this.getUrlSmallImage(result.photos) : undefined,
              rating: result.rating,
            })

          }
          resolve(results);
        }
      });
    }) as any[];

    var options2: any = {
      location: defaultBounds,
      radius: 50000,
      fields: ['photos', 'formatted_address', 'name', 'rating', 'opening_hours', 'geometry', 'price_level']
    };
    options2.type = ['rv_park'];
    let results2 = await new Promise((resolve, reject) => {
      service.nearbySearch(options2, (results, status, pagination) => {
        // console.log(results, status, pagination);
        pagination.nextPage();
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          for (let result of results) {
            this.courst.push({
              lat: result.geometry.location.lat(),
              lng: result.geometry.location.lng(),
              name: result.name,
              location: result.vicinity,
              photos: result.photos ? this.getUrlSmallImage(result.photos) : undefined,
              rating: result.rating,
            })

          }
          resolve(results);
        }
      });
    }) as any[];
    this.courst = this.courst.map(it => {
      it.users = this.getUsersCourt(it);
      return it;
    });
    this.setMarkersOfPlaces(results, results2);
  }

  public formaterUrl(url) {
    return `url(${url})`;
  }

  public getUrlSmallImage(photos) {
    return photos.map(it => {
      return it.getUrl({ 'maxWidth': 200, 'maxHeight': 200 });
    });
  }

  private setMarkersOfPlaces(results_courts, results_rv) {
    this.items = this.courst.map(it => {
      return {
        name: it.name,
        location: it.location,
        photo: it.photos !== undefined ? it.photos[0] : 'assets/imgs/court-sport-default.jpg'
      };
    });
    for (let result of results_courts) {
      let lat = result.geometry.location.lat();
      let lng = result.geometry.location.lng();
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
    }

    for (let result of results_rv) {
      let lat = result.geometry.location.lat();
      let lng = result.geometry.location.lng();
      let image = {
        url: './assets/imgs/camper.png',
        // This marker is 20 pixels wide by 32 pixels high.
        size: new google.maps.Size(35, 21),
        // The origin for this image is (0, 0).
        origin: new google.maps.Point(0, 0),
        // The anchor for this image is the base of the flagpole at (0, 32).
        anchor: new google.maps.Point(17.5, 21)
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
    this.setEventToMarkers();
  }

  private setEventToMarkers() {
    for (let marker of this.markers) {
      google.maps.event.addListener(marker, 'click', e => {
        console.log(e.latLng.lat(), e.latLng.lng());
        this.toCourt(e.latLng.lat(), e.latLng.lng());
      });
    }
  }

  public toCourtSlide(court) {
    if (court.lng !== null && court.lng !== undefined &&
      court.lat !== null && court.lat !== undefined) {
      this.toCourt(court.lat, court.lng);
    }
  }

  private toCourt(lat: number, lng: number) {
    let court = this.courst.find(it => {
      return it.lat === lat && it.lng === lng;
    });
    if (court !== null && court !== undefined)
      this.navCtrl.push(ViewCourtPage, { court });
  }

  private async getCourtsSaved() {
    let user = await AuthProvider.me.getIdUser();
    let query = { user };
    this.courstSaved = await this.http.get(`/court?where=${JSON.stringify(query)}&limit=40000`).toPromise() as any[];
    this.courstSaveds = await this.http.get(`/court?limit=400`).toPromise() as any[];
  }

  public getUsersCourt(court) {
    let users = [];
    if (court.lng !== null && court.lng !== undefined &&
      court.lat !== null && court.lat !== undefined) {
      try {
        let _courts = this.courstSaveds.filter(it => {
          return it.coordinates[0] === court.lng && it.coordinates[1] === court.lat;
        });
        // console.log(_courts);
        users = _courts.map(it => {
          return it.user;
        });
        users = users.filter(it => { return it !== undefined && it !== null && it.id !== this.userID; })
      }
      catch (e) {
        console.error(e);
      }
    }
    return users;
  }

  public isSavedCourt(court) {
    let index = this.courstSaved.findIndex(it => {
      // console.log(it.coordinates.lng === court.lng && it.coordinates.lat === court.lat);
      // console.log(it.coordinates.lng, court.lng, it.coordinates.lat, court.lat);
      return it.coordinates[0] === court.lng && it.coordinates[1] === court.lat;
    });
    if (index === -1) {
      return { saved: false, index };
    }

    return { saved: true, index };
  }


  private async getTournaments(lat, lng) {
    try {
      let tournamets = await this.http.get(`/tournaments-ubication?lat=${lat}&lng=${lng}`).toPromise() as any[];
      for (let tour of tournamets) {
        let image = {
          url: './assets/imgs/medal.png',
          // This marker is 20 pixels wide by 32 pixels high.
          size: new google.maps.Size(20, 41),
          // The origin for this image is (0, 0).
          origin: new google.maps.Point(0, 0),
          // The anchor for this image is the base of the flagpole at (0, 32).
          anchor: new google.maps.Point(10, 20.5)
        };

        new google.maps.Marker({
          animation: 'DROP',
          position: tour.latLng,
          map: this.map,
          icon: image
        });
      }
    }
    catch (e) {
      console.error(e);
    }
  }

  public loadImage(court) {
    court.loadImage = true;
  }

}
