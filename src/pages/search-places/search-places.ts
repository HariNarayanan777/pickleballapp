import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController, ToastController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { LiveComunicationProvider } from '../../providers/live-comunication/live-comunication';
import { DomSanitizer } from '@angular/platform-browser';
import { FormControl } from '@angular/forms';
import { Storage } from '@ionic/storage';
import { RestProvider } from '../../providers/rest/rest';
import { HttpClient } from '@angular/common/http';

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
  public lat = 0;
  public lng = 0;

  public courst = [];
  public markers = [];

  public type = 1;

  constructor(
    public navCtrl: NavController, public navParams: NavParams,
    private geolocation: Geolocation, public sanitizer: DomSanitizer,
    private storage: Storage, private rest: RestProvider,
    public actionSheetCtrl: ActionSheetController, public toastCtrl: ToastController,
    public http: HttpClient
  ) {
    this.searchControl = new FormControl();
    this.storage.get('USER_ID').then(res => {
      this.userID = res;
    });
  }

  async ionViewDidLoad() {

    this.searching = false;
    this.shouldShowCancel = false;

    let position = await this.geolocation.getCurrentPosition();
    await LiveComunicationProvider.reloadGoogleplaces();
    this.autocomplete = new google.maps.places.Autocomplete(document.querySelector("#search-courts-input .searchbar-input"));
    google.maps.event.addListener(this.autocomplete, 'place_changed', function () {
      var address = (document.querySelector("#search-courts-input .searchbar-input") as any).value;
      this.setLocationOfSearch(address);
    }.bind(this));
    this.initMap(position);

  }

  //#region para busquedad de torneos
  public async buscarTorneo() {
    if(this.torneoName===""){
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

  public cancelBuscarTorneo(){
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
    var options: any = {
      location: defaultBounds,
      radius: 50000,
      fields: ['photos', 'formatted_address', 'name', 'rating', 'opening_hours', 'geometry', 'price_level']
    };

    if (this.type === 3) {
      options.type = ['rv_park'];
    } else {
      options.name = 'pickleball courts';
    }

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
            rating: result.rating,
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

  public loadImage(court) {
    court.loadImage = true;
  }

  public setType(num: number) {
    this.type = num;
    if (this.type !== 2) {
      this.getCourts();
    }
  }
  //#endregion

}
