import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ToastController, ActionSheetController, Loading, LoadingController } from 'ionic-angular';
import { FormControl } from '@angular/forms';
import { LiveComunicationProvider } from '../../providers/live-comunication/live-comunication';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { HttpClient } from '@angular/common/http';
import { ViewCourtPage } from '../view-court/view-court';
import { AuthProvider } from '../../providers/auth/auth';
import { ViewTournamentPage } from '../view-tournament/view-tournament';
import { RestProvider } from '../../providers/rest/rest';
import { PublicProfilePage } from '../public-profile/public-profile';
import { InterceptorProvider } from '../../providers/interceptor/interceptor';
import { FilterPage } from '../filter/filter';

declare var google: any;

@IonicPage()
@Component({
  selector: 'page-view-event',
  templateUrl: 'view-event.html',
})
export class ViewEventPage {

  public _viewMap = false;
  public _isChangingLocation = false;
  public type = "";
  public items = [];

  public dateStart = new Date();
  public dateEnd = new Date();

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
  public map: any;
  public lat = 36.778259;
  public lng = -119.417931;
  marker: any;

  public courst = [];
  public courstSaved = [];
  // public courstSaveds = [];
  public markers = [];

  //Para la busquedad de event
  public events = [];

  public maxDistance = 33000;
  public load: Loading;

  public currentLocation = "";

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public viewCtrl: ViewController, public http: HttpClient,
    private zone: NgZone, private rest: RestProvider, public toastCtrl: ToastController,
    private actionSheetCtrl: ActionSheetController, private loadingCtrl: LoadingController
  ) {
    this.type = this.navParams.get("type");
  }

  async ionViewWillEnter() {
    this.userID = await AuthProvider.me.getIdUser();
    if (this.type === "courts")
      await this.getCourtsSaved();
    if (this.type === "tournaments")
      this.getTournaments();
    if (this.type === "clinics" || this.type === "coaches" || this.type === "vacations")
      this.getEvents();
  }

  async ngAfterViewInit() {
    document.querySelector(".back-button").setAttribute("hidden", "");
    await LiveComunicationProvider.reloadGoogleplaces();
    await this.initMap();

    let input = () => { return document.querySelector("#search-courts-input-view-event .searchbar-input") };
    let autocomplete = new google.maps.places.Autocomplete(input());
    google.maps.event.addListener(autocomplete, 'place_changed', () => {
      var address = (input() as any).value;
      this.setLocationOfSearch(address);
    });

    let position = await HelpersProvider.me.getMyPosition();
    // console.log("MyPosition", position);
    if (position)
      this.setPosition(position, true);

  }

  public getBanner() {
    if (this.type === "courts")
      return `url(./assets/imgs/pickleball-doubles.jpg)`;
    else if (this.type === "tournaments")
      return `url(assets/imgs/men-women-1.jpg)`;
    else if (this.type === 'players')
      return `url(assets/imgs/find-players.jpg)`;
    else if (this.type === "clinics")
      return `url(assets/imgs/racket-balls.png)`;
    else if (this.type === "coaches")
      return `url(assets/imgs/pickleballs-player.jpg)`
    else if (this.type === "vacations")
      return `url(assets/imgs/court-sport-default.jpg)`
  }

  public async changeDateStart() {
    // let dateStart = await HelpersProvider.me.nativeDatePicker({
    //   defaultDate: this.dateStart,
    //   title: "Select the initial date"
    // });
    // if (dateStart !== null) {
    //   this.dateStart = dateStart;
    //   if (this.type === "tournaments")
    //     this.getTournaments();
    //   if (this.type === "clinics")
    //     this.getEvents();
    // }
  }

  public async changeDateEnd() {
    // let dateEnd = await HelpersProvider.me.nativeDatePicker({
    //   defaultDate: this.dateStart,
    //   title: "Select the end date"
    // });
    // if (dateEnd !== null) {
    //   this.dateEnd = dateEnd;
    //   if (this.type === "tournaments")
    //     this.getTournaments();
    //   if (this.type === "clinics")
    //     this.getEvents();
    // }
  }

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
      if (this.type === "courts")
        this.getCourts();
      if (this.type === "tournaments")
        this.getTournaments(this.lat, this.lng);
      if (this.type === "clinics" || this.type === "coaches" || this.type === "vacations")
        this.getEvents();
    });
    if (this.type === "courts")
      await this.getCourts();
    if (this.type === "tournaments")
      await this.getTournaments(this.lat, this.lng);
    if (this.type === "clinics" || this.type === "coaches" || this.type === "vacations")
      await this.getEvents();
  }

  private async setPosition(position, getCourts: boolean) {
    console.log(position);
    this.lat = position.coords.latitude;
    this.lng = position.coords.longitude;
    this.marker.setPosition({
      lat: this.lat,
      lng: this.lng
    });
    this.map.setCenter({ lat: this.lat, lng: this.lng });
    if (getCourts === true) {
      if (this.type === "courts")
        await this.getCourts();
      if (this.type === "tournaments")
        await this.getTournaments(this.lat, this.lng);
      if (this.type === "clinics" || this.type === "coaches" || this.type === "vacations")
        this.getEvents();
    }
    // let geocoder = new google.maps.Geocoder();
    // geocoder.geocode({ 'location': { lat: this.lat, lng: this.lng } }, async (res, status) => {

    //   if (Object.prototype.toString.call(res) === "[object Array]") {
    //     if (res.length === 0) return;
    //     res = res[0];
    //   }

    //   if (res.geometry) {
    //     let address = res.formatted_address;
    //     (document.querySelector("#search-courts-input-view-event .searchbar-input") as any).value = address;
    //   }

    // });
  }

  private setLocationOfSearch(address: string) {
    let geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address }, (res, status) => {

      if (Object.prototype.toString.call(res) === "[object Array]") {
        if (res.length === 0) return;
        res = res[0];
      }

      if (res.geometry) {
        let estado = "", i = 0;
        for (let des of res.address_components) {
          if (i === 0) {
            estado += " "+ des.short_name;
          }
          estado += " "+ des.long_name;
          i += 1;
        }
        this.currentLocation = estado;
        // console.log(this.currentLocation);
        // console.log(res);
        this.lat = res.geometry.location.lat();
        this.lng = res.geometry.location.lng();

        this.marker.setPosition({
          lat: this.lat,
          lng: this.lng
        });
        this.map.setCenter({ lat: this.lat, lng: this.lng });
        if (this.type === "courts")
          this.getCourts();
        if (this.type === "tournaments")
          this.getTournaments(this.lat, this.lng);
        if (this.type === "clinics" || this.type === "coaches" || this.type === "vacations")
          this.getEvents();
      }

    });

  }

  public viewMap() {
    this._viewMap = !this._viewMap;
    if (this._viewMap === false) this._isChangingLocation = false;
  }

  public formaterUrl(url) {
    return `url(${url})`;
  }

  public isSaved(data) {
    if (this.type === "courts")
      return this.isSavedCourt(data).saved;
    if (this.type === "tournaments")
      return this.isSavedTournament(data);
    if (this.type === "clinics")
      return this.isSaveEvent(data);
  }

  public save(data) {
    if (this.type === "courts")
      return this.saveCourt(data);
    if (this.type === "tournaments")
      return this.saveTournament(data);
    if (this.type === "clinics")
      return this.saveEvent(data);
  }

  public remove(data) {
    if (this.type === "courts")
      return this.removeCourt(data);
    if (this.type === "tournaments")
      return this.removeTournament(data);
    if (this.type === "clinics")
      return this.removeEvent(data);
  }

  public toItem(data) {
    if (this.type === "courts")
      return this.toCourtSlide(data);
    if (this.type === "tournaments")
      return this.toTournament(data);
  }

  public filter() {
    let milla = 0.000621371;
    let inputValue = () => { return (document.querySelector("#search-courts-input-view-event .searchbar-input") as any).value; };
    let maxDistance = this.maxDistance * milla;
    let appyFilter = async data => {
      if (!data) {
        if (document.querySelector("ion-buttons[end] button .button-inner .active-filter") !== null) {
          document.querySelector("ion-buttons[end] button .button-inner .active-filter").parentElement
            .removeChild(document.querySelector("ion-buttons[end] button .button-inner .active-filter"));
        }
        return;
      }
      if (document.querySelector("ion-buttons[end] button .button-inner .active-filter") === null) {
        document.querySelector("ion-buttons[end] button .button-inner").innerHTML = `
        <div class="active-filter"></div>
        Filter`;
      }

      this.dateStart = data.dateStart;
      this.dateEnd = data.dateEnd;
      this.maxDistance = parseInt((data.maxDistance / milla).toString(), 10);
      let input = () => { return document.querySelector("#search-courts-input-view-event .searchbar-input") };
      if (data.address !== "") {
        (input() as any).value = data.address;
        this.setLocationOfSearch(data.address);
      } else {
        let position = await HelpersProvider.me.getMyPosition();
        this.setPosition(position, true);
      }

      if (this.type === "tournaments") {
        await this.getTournaments();
      }

      if (this.type === "clinics" || this.type === "coaches" || this.type === "vacations")
        this.getEvents();

    };

    if (this.type === "courts") {
      let f = HelpersProvider.me.modalCtrl.create(FilterPage, {
        type: "court",
        dateStart: this.dateStart,
        dateEnd: this.dateEnd,
        myCurrentLocation: inputValue() === "",
        address: inputValue() !== "" ? inputValue() : "",
        maxDistance
      });
      f.onDidDismiss(appyFilter);
      f.present();
    } else if (this.type === "tournaments" || this.type === "clinics" || this.type === "coaches" || this.type === "vacations") {
      let f = HelpersProvider.me.modalCtrl.create(FilterPage, {
        type: "tournament",
        dateStart: this.dateStart,
        dateEnd: this.dateEnd,
        myCurrentLocation: inputValue() === "",
        address: inputValue() !== "" ? inputValue() : "",
        maxDistance
      })
      f.onDidDismiss(appyFilter);
      f.present();
    }
  }

  //#region para obtener los courts
  public changeSearch() {
    this._isChangingLocation = !this._isChangingLocation;
    if (this._isChangingLocation === true) this._viewMap = true;
  }

  public isChangingLocation() {
    return this._isChangingLocation === true && this._viewMap === true;
  }

  private cleanMarkers() {
    for (var i = 0; i < this.markers.length; i++) {
      this.markers[i].setMap(null);
    }
    this.markers = [];
  }

  private async getCourts() {
    this.load = this.loadingCtrl.create();
    this.load.present({ disableApp: true });
    this.courst = [];
    this.cleanMarkers();
    let defaultBounds = new google.maps.LatLng(this.lat, this.lng);
    let fields = ['photos', 'formatted_address', 'name', 'rating', 'opening_hours', 'geometry', 'price_level', 'website', 'international_phone_number']
    let options: any = {
      location: defaultBounds,
      radius: this.maxDistance,
      fields
    };
    options.name = 'pickleball courts';


    let service = new google.maps.places.PlacesService(this.map);

    let results = await new Promise((resolve, reject) => {
      service.nearbySearch(options, (results, status, pagination) => {
        // console.log(results);
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
              place_id: result.place_id
            })

          }
        }
        resolve(results);
      });
    }) as any[];

    var options2: any = {
      location: defaultBounds,
      radius: this.maxDistance,
      fields
    };
    options2.type = ['rv_park'];
    let results2 = await new Promise((resolve, reject) => {
      service.nearbySearch(options2, (results, status, pagination) => {
        // console.log(results);
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
              place_id: result.place_id
            })

          }
        }
        resolve(results);
      });
    }) as any[];
    this.courst = this.courst.map(it => {
      it.users = this.getUsersCourt(it);
      return it;
    });
    this.setMarkersOfPlaces(results, results2);
  }

  public getUrlSmallImage(photos) {
    return photos.map(it => {
      return it.getUrl({ 'maxWidth': 200, 'maxHeight': 200 });
    });
  }

  private setMarkersOfPlaces(results_courts, results_rv) {
    if (this.type === "courts") {
      this.items = this.courst.map(it => {
        return {
          name: it.name,
          location: it.location,
          photo: it.photos !== undefined ? it.photos[0] : 'assets/imgs/court-sport-default.jpg',
          data: it
        };
      });
    }

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
    this.load.dismiss();
    this.zone.run(function () { console.log("fetch courts"); });
  }

  private setEventToMarkers() {
    for (let marker of this.markers) {
      google.maps.event.addListener(marker, 'click', e => {
        // console.log(e.latLng.lat(), e.latLng.lng());
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
    let save = this.isSavedCourt(court);
    if (save.saved === true) {
      court.id = this.courstSaved[save.index].id;
    } else
      delete court.id;
    if (court !== null && court !== undefined) {
      let fields = ['photos', 'formatted_address', 'name', 'rating', 'opening_hours', 'geometry', 'price_level', 'website', 'international_phone_number', 'formatted_phone_number']
      let service = new google.maps.places.PlacesService(this.map);
      var request = {
        placeId: court.place_id,
        fields
      };
      service.getDetails(request, place => {
        console.log(place);
        court.photos = place.photos ? place.photos.map(it => it.getUrl({ 'maxWidth': 600, 'maxHeight': 200 })) : court.photos;
        court.website = place.website || undefined;
        court.formatted_phone_number = place.formatted_phone_number || undefined;
        court.opening_hours = place.opening_hours || undefined;
        this.navCtrl.push(ViewCourtPage, { court });
      });

    }

  }

  private async getCourtsSaved() {
    let user = await AuthProvider.me.getIdUser();
    let query = { user };
    this.courstSaved = await this.http.get(`/court-find?where=${JSON.stringify(query)}`).toPromise() as any[];
    // this.courstSaveds = await this.http.get(`/court?limit=400`).toPromise() as any[];
  }

  public getUsersCourt(court) {
    let index = this.courstSaved.findIndex(it => {
      return it.coordinates[0] === court.lng && it.coordinates[1] === court.lat;
    });
    if (index !== -1) return court.users;
    return [];
  }

  public async saveCourt(court) {
    if (court.lng !== null && court.lng !== undefined &&
      court.lat !== null && court.lat !== undefined) {
      try {
        let user = await AuthProvider.me.getIdUser();
        let ite = JSON.parse(JSON.stringify(court));
        ite.coordinates = [ite.lng, ite.lat];
        delete ite.lng;
        delete ite.lat;
        ite.user = user;
        await this.http.post("/court", ite).toPromise();
        // this.presentToast("Saved Court");
        await this.getCourtsSaved();
      }
      catch (e) {
        console.error(e);
      }
    }
  }

  public async removeCourt(court) {
    let pos = await this.isSavedCourt(court);
    if (pos.saved === true) {
      await this.http.delete(`/court/${this.courstSaved[pos.index].id}`).toPromise();
      // this.presentToast("Courst Removed");
      await this.getCourtsSaved();
    }
  }

  public isSavedCourt(court) {
    let index = this.courstSaved.findIndex(it => {
      return it.coordinates[0] === court.lng && it.coordinates[1] === court.lat;
    });
    if (index === -1) {
      return { saved: false, index };
    }

    return { saved: true, index };
  }

  public loadImage(court) {
    court.loadImage = true;
  }
  //#endregion

  //#region para los torneos
  private async getTournaments(lat?, lng?) {
    this.lat = lat || this.lat;
    this.lng = lng || this.lng;
    try {
      let tournamets = await this.http.get(`/tournaments-ubication?lat=${this.lat}&lng=${this.lng}&user=${this.userID}&filterDate=true&startDate=${this.dateStart.getTime()}&endDate=${this.dateEnd.getTime()}&maxDistance=${this.maxDistance}`).toPromise() as any[];
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
      this.items = tournamets.map(it => {
        return {
          name: it.title,
          location: it.address,
          photo: it.imgs !== undefined && it.imgs.length > 0 ? it.imgs[0].includes("/" + it.id) === true ? InterceptorProvider.tranformUrl(it.imgs[0]) : it.imgs[0] : 'assets/imgs/court-sport-default.jpg',
          data: it
        };
      });
      this.zone.run(function () { console.log("fetch tournaments"); });
      // this.getTournamentsSaved();
    }
    catch (e) {
      console.error(e);
    }
  }

  // public async getTournamentsSaved() {
  //   let idUser = await AuthProvider.me.getIdUser();
  //   let tournaments = await this.http.get(`/savedtournaments?where=${JSON.stringify({ user: idUser })}&limit=40000`).toPromise() as any;
  //   tournaments = tournaments.filter(it => {
  //     return it.tournament !== null && it.tournament !== undefined;
  //   });
  //   this.tournaments = tournaments.map(it => {
  //     it.tournament.savedID = it.id;
  //     return it.tournament;
  //   });
  // }

  public isSavedTournament(tour) {
    // let index = this.tournaments.findIndex(it => {
    //   return it.coordinates[0] === tour.coordinates[0] && it.coordinates[1] === tour.coordinates[1];
    // });
    // if (index === -1) {
    //   return { saved: false, index };
    // }

    // return { saved: true, index };
    return tour.isSave;
  }

  public async saveTournament(tournament) {
    try {
      let idUser = await AuthProvider.me.getIdUser();
      if (tournament.type === "event")
        await this.http.post('/eventuser', { user: idUser, event: tournament.id }).toPromise();
      else
        await this.http.post('/savedtournaments', { user: idUser, tournament: tournament.id }).toPromise();
      await this.getTournaments();
    }
    catch (e) {
      console.error(e);
    }
  }

  public async removeTournament(tournament) {
    try {
      if (tournament.type === "event")
        await this.http.delete('/eventuser/' + tournament.savedId).toPromise();
      else
        await this.http.delete('/savedtournaments/' + tournament.savedId).toPromise();
      await this.getTournaments();
    }
    catch (e) {
      console.error(e);
    }
  }

  public toTournament(tournament) {
    this.navCtrl.push(ViewTournamentPage, { tournament, save: true });
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

  public errorImage(e) {
    e.target.src = "./assets/imgs/default-user.png";
  }

  public getUrlImage(player) {
    if (player.loginFacebook) {
      return player.loginFacebook.image;
    }
    return "";
  }

  cancel() {
    this.searching = false;
    this.players = [];
  }


  checkFriendRequest(player, $event) {
    if (this.sendRequestAllow(player) === true) {
      this.addFriend(player, $event);
    }
    let index = player.requests.findIndex(it => {
      if (it.response === null) return true;
      return false;
    });
    if (index !== -1)
      this.cancelRequestActionSheet($event, player.requests[index]);
  }

  public addFriend(player, $event) {
    let payload = {
      from: this.userID,
      to: player['_id']
    }
    this.rest.postData('/requestfriend', payload).subscribe(res => {
      console.log("Request", res);
      $event.srcElement.innerText = 'Cancel Request';
      this.presentToast("Friendship Request sent!");
      this.onSearchInput();
    })
  }

  presentToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000
    });
    toast.present();
  }

  public sendRequestAllow(user) {
    if (user.requests.length === 0) return true;
    let indexResponseTrue = user.requests.findIndex(it => {
      if (it.response === true || it.response === null) return true;
      return false;
    });
    console.log("all", indexResponseTrue);
    return indexResponseTrue === -1;
  }

  public isFriend(user) {
    let isFriend = false;
    for (let request of user.requests) {
      if (request.response === true) {
        isFriend = true;
        break;
      }

    }

    return !isFriend;
  }

  cancelRequestActionSheet($event, request) {
    const actionSheet = this.actionSheetCtrl.create({
      title: 'Request',
      buttons: [
        {
          text: 'Cancel Request',
          role: 'destructive',
          handler: () => {
            console.log('Destructive clicked');
            this.cancelRequest($event, request);
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

  cancelRequest($event, request) {
    this.rest.removeData('/requestfriend/' + request['id']).subscribe(res => {
      this.onSearchInput();
      $event.srcElement.innerText = 'Add Friend';
      this.presentToast("Friendship Request cancelled!");
      this.onSearchInput();
    })
  }

  goToFriendProfile(userID) {
    this.navCtrl.push(PublicProfilePage, { 'userID': userID });
  }
  //#endregion

  //#region para busquedad de eventos
  public async getEvents() {
    if (this.userID === undefined) this.userID = await AuthProvider.me.getIdUser();
    this.events = await this.http.get(`/event-coordinates?user=${this.userID}&lat=${this.lat}&lng=${this.lng}&filterDate=true&startDate=${this.dateStart.getTime()}&endDate=${this.dateEnd.getTime()}&maxDistance=${this.maxDistance}&type=${this.type}`).toPromise() as any;
    this.items = this.events.map(it => {
      return {
        name: it.name,
        location: it.locationText,
        photo: it.images !== undefined && it.images.length > 0 ? InterceptorProvider.tranformUrl(it.images[0]) : 'assets/imgs/court-sport-default.jpg',
        data: it
      };
    });
    this.zone.run(function () { console.log("fetch events"); });
  }

  public isSaveEvent(event) {
    return event.isSave;
  }

  public async saveEvent(event) {
    try {
      await this.http.post(`/eventuser`, { user: this.userID, event: event.id }).toPromise();
      await this.getEvents();
    } catch (error) {
      console.error(error);
    }
  }

  public async removeEvent(event) {
    try {
      await this.http.delete(`/eventuser/${event.savedId}`).toPromise();
      await this.getEvents();
    } catch (error) {
      console.error(error);
    }
  }

  //#endregion
}
