import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController, ToastController, Platform, LoadingController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { LiveComunicationProvider } from '../../providers/live-comunication/live-comunication';
import { DomSanitizer } from '@angular/platform-browser';
import { FormControl } from '@angular/forms';
import { Storage } from '@ionic/storage';
import { RestProvider } from '../../providers/rest/rest';
import { HttpClient } from '@angular/common/http';
import { Diagnostic } from '@ionic-native/diagnostic';
import { AuthProvider } from '../../providers/auth/auth';

declare var google: any;

@IonicPage()
@Component({
  selector: 'page-search-places',
  templateUrl: 'search-places.html',
})
export class SearchPlacesPage {

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
  public markers = [];

  public type = 1;

  constructor(
    public navCtrl: NavController, public navParams: NavParams,
    private geolocation: Geolocation, public sanitizer: DomSanitizer,
    private storage: Storage, private rest: RestProvider,
    public actionSheetCtrl: ActionSheetController, public toastCtrl: ToastController,
    public http: HttpClient, public diagnostic: Diagnostic,
    private platform: Platform, public loadingCtrl: LoadingController
  ) {
    this.searchControl = new FormControl();
    this.storage.get('USER_ID').then(res => {
      this.userID = res;
    });
    // this.ionViewDidLoad();
  }

  async ionViewDidLoad() {

    this.searching = false;
    this.shouldShowCancel = false;
    await LiveComunicationProvider.reloadGoogleplaces();
    console.log("loading google maps");
    await this.initMap();

    let position: any;
    if (this.platform.is("cordova") === true) {
      console.log("cordova");
      if (await this.diagnostic.isLocationAuthorized() === false) {
        await this.diagnostic.requestLocationAuthorization();
        console.log("pide solicitud");
        if (await this.diagnostic.isLocationAuthorized() === true) {
          console.log("Location Authorized");
          position = await this.geolocation.getCurrentPosition();
          console.log("init mapa");
          this.setPosition(position);
        }
      } else {
        console.log("pide position");
        position = await this.geolocation.getCurrentPosition();
        console.log("init mapa");
        this.setPosition(position);
      }
      console.log("cordova finish");
    } else {
      position = await this.geolocation.getCurrentPosition();
      this.setPosition(position);
    }

    this.autocomplete = new google.maps.places.Autocomplete(document.querySelector("#search-courts-input .searchbar-input"));
    google.maps.event.addListener(this.autocomplete, 'place_changed', function () {
      var address = (document.querySelector("#search-courts-input .searchbar-input") as any).value;
      this.setLocationOfSearch(address);
    }.bind(this));

  }

  //#region para busquedad de torneos
  public async buscarTorneo() {
    if (this.torneoName === "") {
      this.tournaments = [];
      return;
    }
    try {
      this.tournaments = await this.http.get(`/tournaments-search?name=${this.torneoName}`).toPromise() as any[];
    }
    catch (e) {
      console.error(e);
    }
  }

  public cancelBuscarTorneo() {
    this.tournaments = [];
  }

  public saved(tournaments) {
    let idUser = this.userID;
    return tournaments.savedTournaments.findIndex(it => {
      return it.user === idUser;
    }) !== -1;
  }

  public async addOrRemove(tour, save) {
    let idUser = this.userID;
    if (save === true) {
      let index = tour.savedTournaments.findIndex(it => {
        return it.user === idUser;
      });
      await this.http.delete('/savedtournaments/' + tour.savedTournaments[index].id).toPromise();
      if (tour.savedTournaments.length === 1)
        tour.savedTournaments = [];
      else
        tour.savedTournaments.splice(index, 1);

    } else {
      let index = tour.savedTournaments.findIndex(it => {
        return it.user === idUser;
      });
      await this.http.post('/savedtournaments', { user: idUser, tournament: tour.id }).toPromise();
      tour.savedTournaments.push({ user: idUser, tournament: tour.id });
    }
  }

  //#endregion

  //#region para busquedad de players
  onSearchInput() {
    if (this.searchTerm === "") {
      this.searching = false;
      this.shouldShowCancel = false;
    } else {
      this.searching = true;
      this.shouldShowCancel = true;
      this.getdata();
    }

  }

  getdata() {
    this.rest.getData(`/users/finds/${this.userID}?name=${this.searchTerm}`).subscribe(
      result => {
        this.players = result;
      },
      err => {
        console.error("Error : " + err);
      });
  }

  cancel() {
    this.searching = false;
  }


  checkFriendRequest(player, $event) {
    this.disable = true;
    if (typeof player['requests'] !== 'undefined' && player['requests'].length > 0) {
      this.cancelRequestActionSheet(player, $event);
    } else {
      this.addFriend(player, $event);
    }
  }

  addFriend(player, $event) {
    let payload = {
      from: this.userID,
      to: player['_id']
    }
    this.rest.postData('/requestfriend', payload).subscribe(res => {
      console.log("Request", res);
      $event.srcElement.innerText = 'Cancel Request';
      this.presentToast("Friendship Request sent!");
      this.disable = false;
    })
  }

  presentToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000
    });
    toast.present();
  }

  cancelRequestActionSheet(player, $event) {
    const actionSheet = this.actionSheetCtrl.create({
      title: 'Modify your album',
      buttons: [
        {
          text: 'Cancel Request',
          role: 'destructive',
          handler: () => {
            console.log('Destructive clicked');
            this.cancelRequest(player, $event);
          }
        }, {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    actionSheet.present();
  }

  cancelRequest(player, $event) {
    this.rest.removeData('/requestfriend/' + player['requests'][0]['id']).subscribe(res => {
      console.log("Cancel Request", res);
      $event.srcElement.innerText = 'Add Friend';
      this.presentToast("Friendship Request cancelled!");
      this.disable = false;
    })
  }
  //#endregion

  //#region Para busquedad de courts
  private async initMap() {
    
    let mapOptions: any = {
      center: {
        lat: this.lat,
        lng: this.lng
      },
      zoom: 8
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

    google.maps.event.addListener(this.map, 'click', function (event) {
      console.log(event);
      this.lat = event.latLng.lat();
      this.lng = event.latLng.lng();

      this.marker.setPosition({
        lat: this.lat,
        lng: this.lng
      });
      this.map.setCenter({ lat: this.lat, lng: this.lng });
      this.getCourts();
      this.getTournaments();
    }.bind(this));

    this.getCourts();
  }

  private setPosition(position) {
    this.lat = position.coords.latitude;
    this.lat = position.coords.longitud;
    this.marker.setPosition({
      lat: this.lat,
      lng: this.lng
    });
    this.map.setCenter({ lat: this.lat, lng: this.lng });
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
              rating: result.rating,
            })

          }
          resolve(results);
        }
      });
    }) as any[];

    this.setMarkersOfPlaces(results, results2);
  }

  private setMarkersOfPlaces(results_courts, results_rv) {
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

  public setType(num: number) {
    this.type = num;
    if (this.type !== 2) {
      this.getCourts();
    }
  }

  public async saveCourts() {
    let load = this.loadingCtrl.create();
    load.present();
    try {
      let user = await AuthProvider.me.getIdUser();
      let courts = this.courst.filter(it => {
        return it.lng !== null && it.lng !== undefined &&
          it.lat !== null && it.lat !== undefined;
      }).map(it => {
        it.coordinates = [it.lng, it.lat];
        delete it.lng;
        delete it.lat;
        it.user = user;
        return it;
      });
      await this.http.post("/court-bulk", { courts }).toPromise();
      this.presentToast("Courts Saved");
    } catch (err) {
      console.error(err);
    }
    load.dismiss();
  }

  //#endregion

}
