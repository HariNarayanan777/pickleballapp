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


@IonicPage()
@Component({
  selector: 'page-account',
  templateUrl: 'account.html',
})
export class AccountPage {

  profileImg: any;
  userID: any;
  fullName: any;
  email: any;
  zipcode: any;
  rank: any;
  public resultsCourts = [];
  public resultsTournaments = [];
  segment:any = 'events';

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private fb: Facebook,
    private storage: Storage,
    private app: App,
    private rest: RestProvider,
    public modalCtrl: ModalController,
    public http: HttpClient,
    private platform: Platform
  ) {
    this.init();
  }

  async ionViewWillEnter() {
    try {
      let miPosition = await HelpersProvider.me.getMyPosition();
      if (miPosition) {
        let lng = miPosition.coords.longitude;
        let lat = miPosition.coords.latitude;
        // let lng = -85.82501576;
        // let lat = 11.43211537;
        this.resultsCourts = await this.http.get(`/court-position?lng=${lng}&lat=${lat}`).toPromise() as any;
        this.resultsTournaments = await this.http.get(`/tournaments-ubication?lng=${lng}&lat=${lat}`).toPromise() as any;
        console.log(this.resultsCourts, this.resultsTournaments);
      }
    }
    catch (e) {
      console.error(e);
    }
  }

  public validNear() {
    return this.resultsCourts.length > 0 || this.resultsTournaments.length > 0
  }

  public getNearEntityMessage() {
    if (this.resultsCourts.length > 0 && this.resultsTournaments.length === 0) {
      return "It's close to Courts";
    }
    if (this.resultsCourts.length === 0 && this.resultsTournaments.length > 0) {
      return "It's close to Tournaments";
    }
    if (this.resultsCourts.length > 0 && this.resultsTournaments.length > 0) {
      return "It is close to Courts and Tournaments";
    }

    return "";
  }

  init() {
    this.getProfileImage();
    this.storage.get('USER_ID').then(res => {
      this.userID = res;
      this.getProfile();

    });
  }

  getProfileImage() {
    this.fb.api('me?fields=picture.width(720).height(720).as(picture_large)', []).then(picture => {
      this.profileImg = picture['picture_large']['data']['url'];
    })
  }

  async logout() {
    if (this.platform.is("cordova")) {
      let withEmail = await this.storage.get('SESIONEMAIL');
      if (withEmail === true) {
        this.storage.set('LOGGED_IN', false);
        MyApp.setNotifications = false;
        this.app.getRootNav().setRoot(LoginPage);
      } else {
        this.fb.logout().then(res => {
          console.log(res);
          this.storage.set('LOGGED_IN', false);
          MyApp.setNotifications = false;
          this.removeToken();
          this.app.getRootNav().setRoot(LoginPage);
        });
      }
    } else {
      this.storage.set('LOGGED_IN', false);
      MyApp.setNotifications = false;
      this.app.getRootNav().setRoot(LoginPage);
    }
  }

  private async removeToken() {
    try {
      let token = await this.storage.get("tokenNotification");
      let userID: any = await this.storage.get("USER_ID");
      await this.http.put("/logout", { token, id: userID }, { responseType: "text" }).toPromise();
      await this.storage.remove("tokenNotification");
      await this.storage.remove("USER_ID");
      localStorage.removeItem("updateTokens");
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
    });

  }

  presentModal() {
    const modal = this.modalCtrl.create(UpdateAccountPage);
    modal.onDidDismiss(data => {
      if (data['updated'] == true) {
        this.init();
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

  public toSavedTournments() {
    this.navCtrl.push(SavedTournamentsPage);
  }

  public toSavedCourts() {
    this.navCtrl.push(CourtsSavedPage);
  }

  public toNearCourtsTournaments() {
    this.navCtrl.push(NearCourtsAndTournamentsPage, { resultsCourts: this.resultsCourts, resultsTournaments: this.resultsTournaments });
  }

  public toViewFriends(){
    this.navCtrl.push(ListFriendPage);
  }

}
