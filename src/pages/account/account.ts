import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App, ModalController, Platform } from 'ionic-angular';
import { Facebook } from '@ionic-native/facebook';
import { Storage } from '@ionic/storage';
import { LoginPage } from '../login/login';
import { RestProvider } from '../../providers/rest/rest';
import { UpdateAccountPage } from '../update-account/update-account';
import { MyApp } from '../../app/app.component';
import { HttpClient } from '@angular/common/http';
import { FutureTournamentsPage } from '../future-tournaments/future-tournaments';
import { SavedTournamentsPage } from '../saved-tournaments/saved-tournaments';
import { ShareAppPage } from '../share-app/share-app';
import { CourtsSavedPage } from '../courts-saved/courts-saved';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { NearCourtsAndTournamentsPage } from '../near-courts-and-tournaments/near-courts-and-tournaments';
import { ListChatPage } from '../list-chat/list-chat';
import { ListFriendPage } from '../list-friend/list-friend';
import { AuthProvider } from '../../providers/auth/auth';
import { CreateEventPage } from '../create-event/create-event';
import { ShareEventFriendsPage } from '../share-event-friends/share-event-friends';
import { TabsPage } from '../tabs/tabs';
import { InterceptorProvider } from '../../providers/interceptor/interceptor';
import { ViewTournamentPage } from '../view-tournament/view-tournament';
import { LiveComunicationProvider } from '../../providers/live-comunication/live-comunication';
import { PublicProfilePage } from '../public-profile/public-profile';
import { ViewCourtPage } from '../view-court/view-court';

declare var google: any;

@IonicPage()
@Component({
  selector: 'page-account',
  templateUrl: 'account.html',
})
export class AccountPage {

  user: any = {};
  profileImg: any;
  userID: any;
  fullName: any;
  email: any;
  zipcode: any;
  rank: any;
  public listFriend = [];
  public listEvents = [];
  public listCourts = [];
  public resultsCourts = [];
  public resultsTournaments = [];
  segment: any = 'events';

  public address = "";
  public map: any = {};

  constructor(
    public navCtrl: NavController, public navParams: NavParams,
    private fb: Facebook, private storage: Storage,
    private app: App, private rest: RestProvider,
    public modalCtrl: ModalController, public http: HttpClient,
    private platform: Platform
  ) {
    this.init();
  }

  async ionViewWillEnter() {
    try {
      try {

        await this.getFriends();
        let user = await AuthProvider.me.getIdUser(),
          query: any = { user };
        this.user = await this.http.get(`/user/${user}`).toPromise();
        this.listCourts = await this.http.get(`/courtsaved?where=${JSON.stringify(query)}&limit=3&sort=createdAt DESC`).toPromise() as any[];
        query = { date: { ">": new Date().getTime() }, user: await AuthProvider.me.getIdUser() };
        this.listEvents = await this.http.get(`/event?where=${JSON.stringify(query)}&limit=3&sort=createdAt DESC`).toPromise() as any[];
      } catch (error) {
        console.error(error);
      }
      await LiveComunicationProvider.reloadGoogleplaces();
      try {
        let miPosition = await HelpersProvider.me.getMyPosition();
        if (this.user.zipCode) {
          let lng = miPosition.coords.longitude;
          let lat = miPosition.coords.latitude;
          this.resultsCourts = await this.http.get(`/court-position?lng=${lng}&lat=${lat}`).toPromise() as any;
          this.resultsTournaments = await this.http.get(`/tournaments-ubication?lng=${lng}&lat=${lat}`).toPromise() as any;
        }
        this.getAddress(this.user.zipCode);
      } catch (error) {
        console.error(error);
      }
    }
    catch (e) {
      console.error(e);
    }
  }

  async ionViewDidLoad() {
    await LiveComunicationProvider.reloadGoogleplaces();
    let mapOptions: any = {
      center: {
        lat: 36.778259,
        lng: -119.417931
      },
      zoom: 12
    };
    this.map = new google.maps.Map(document.getElementById("map_tls_account"), mapOptions);
  }

  public transformUrl(img) {
    return InterceptorProvider.tranformUrl(img)
  }

  private getAddress(zipCode) {
    let geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': zipCode}, async (res, status) => {

      if (Object.prototype.toString.call(res) === "[object Array]") {
        if (res.length === 0) return;
        res = res[0];
      }
      let address = '';
      if(res.address_components){
        for(let cmp of res.address_components){
          for(let t of cmp.types){
            if(t==='locality' || t==='administrative_area_level_1'){
              address += " "+ cmp.long_name;
            }
          }
        }
      }
      if (address !== '') { console.log(address);
        this.address = res.formatted_address;
        await this.http.put(`/user-location`, {
          location: address,
          idUser: this.userID
        }).toPromise();
        this.address = address;
      }

    });
  }

  async getFriends() {
    let userID: any = await AuthProvider.me.getIdUser();
    let query = { "or": [{ from: userID, response: true }, { to: userID, response: true }] };
    let users = await this.http.get(`/requestfriend?where=${JSON.stringify(query)}`).toPromise() as any[];
    this.listFriend = users.map(it => {
      let user;
      if (it.from.id === userID)
        user = it.to;
      else
        user = it.from;
      user.photo = HelpersProvider.me.getPhotoUrl(user);
      user.requestID = it.id;
      return user;
    });
  }

  public validNear() {
    return this.resultsCourts.length > 0 || this.resultsTournaments.length > 0
  }

  public getNearEntityMessage() {
    if (this.resultsCourts.length > 0 && this.resultsTournaments.length === 0) {
      return "Nearby Courts";
    }
    if (this.resultsCourts.length === 0 && this.resultsTournaments.length > 0) {
      return "Nearby Tournaments";
    }
    if (this.resultsCourts.length > 0 && this.resultsTournaments.length > 0) {
      return "Nearby Tournaments & Courts";
    }

    return "";
  }

  init() {
    this.storage.get('USER_ID').then(res => {
      this.userID = res;
      this.getProfile();
    });
  }

  public formatNumber(n){
    return (parseFloat(n) as any).toFixed("1");
  }

  public errorUserImage(e) {
    e.target.src = "assets/imgs/default-user-2.png";
  }

  async logout() {
    await this.storage.set('LOGGED_IN', false);
    let finish = async () => {
      await this.storage.remove("USER_TOKEN");
      await this.storage.remove("SESIONEMAIL");
      await this.storage.remove("USER_ID");
      MyApp.setNotifications = false;
      this.app.getRootNav().setRoot(LoginPage);
    };
    if (this.platform.is("cordova")) {
      await this.removeToken();
      await MyApp.unregisterNotifications();
      await HelpersProvider.me.stopBackgroundLocation();
      let withEmail = await this.storage.get('SESIONEMAIL');
      if (withEmail === true) {
        finish();
      } else {
        this.fb.logout().then(finish);
      }
    } else {
      finish();
    }
  }

  private async removeToken() {
    try {
      let token = await this.storage.get("tokenNotification");
      let userID: any = await this.storage.get("USER_ID");
      await this.http.put("/logout", { token, id: userID }, { responseType: "text" }).toPromise();
      await this.storage.remove("tokenNotification");
      await this.storage.remove("USER_ID");
    }
    catch (e) {
      console.error(e);
    }
  }

  getProfile() {
    this.rest.getData('/user/' + this.userID).subscribe(data => {
      console.log(data);
      this.fullName = data['fullName'];
      this.email = data['email'];
      this.zipcode = data['zipCode'];
      this.rank = data['rank'];
      this.address = data["location"];
      console.log(data);
      this.profileImg = HelpersProvider.me.getPhotoUrl(data);
    });

  }

  public presentModal() {
    const modal = this.modalCtrl.create(UpdateAccountPage);
    modal.onDidDismiss(data => {
      if (data) {
        if (data['updated'] == true) {
          this.init();
        }
      }
    });
    modal.present();
  }

  public shareApp() {
    this.navCtrl.push(ShareAppPage);
  }

  public toFutureTournments() {
    this.navCtrl.push(FutureTournamentsPage);
  }

  public toSavedTournments(isEvents) {
    this.navCtrl.push(SavedTournamentsPage, { isEvents });
  }

  public toSavedCourts() {
    this.navCtrl.push(CourtsSavedPage);
  }

  public toNearCourtsTournaments() {
    this.navCtrl.push(NearCourtsAndTournamentsPage, { resultsCourts: this.resultsCourts, resultsTournaments: this.resultsTournaments });
  }

  public toViewFriends() {
    this.navCtrl.push(ListFriendPage);
  }

  public createEvent() {
    this.navCtrl.push(CreateEventPage);
  }

  public toShareEvent(event) {
    this.navCtrl.push(ShareEventFriendsPage, { event });
  }

  public toEvent(it) {
    let ev = {
      title: it.name,
      address: it.locationText,
      imgs: it.images !== undefined && it.images.length > 0 ? it.images : ['assets/imgs/court-sport-default.jpg'],
      id: it.id,
      coordinates: it.locationCoords,
      type: "event",
      dates: it.matchTimes,
      registrationStart: it.date,
      endRegistration: it.date,
      note: it.travelInfo
    };
    this.navCtrl.push(ViewTournamentPage, { tournament: ev, isEvent: true });
  }

  public toCourt(court) {
    this.navCtrl.push(ViewCourtPage, court);
    // CourtsSavedPage.toCourtDetails(this, court);
  }

  public toHome() {
    TabsPage.toTab(0);
  }

  public goToFriendProfile(userID) {
    this.navCtrl.push(PublicProfilePage, { 'userID': userID });
  }

  public async deleteFriend(user) {
    try {
      await this.http.delete(`/requestfriend/${user.requestID}`).toPromise();
      await this.getFriends();
    }
    catch (e) {
      console.error(e);
    }
  }

}
