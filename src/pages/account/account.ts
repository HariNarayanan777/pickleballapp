import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App, ModalController } from 'ionic-angular';
import { Facebook } from '@ionic-native/facebook';
import { Storage } from '@ionic/storage';
import { LoginPage } from '../login/login';
import { RestProvider } from '../../providers/rest/rest';
import { UpdateAccountPage } from '../update-account/update-account';
import { MyApp } from '../../app/app.component';
import { HttpClient } from '@angular/common/http';


@IonicPage()
@Component({
  selector: 'page-account',
  templateUrl: 'account.html',
})
export class AccountPage {

  profileImg:any;
  userID:any;
  fName:any;
  lName:any;
  email:any;
  zipcode:any;
  rank:any;


  constructor(public navCtrl: NavController, public navParams: NavParams,
    private fb: Facebook,
    private storage: Storage,
    private app: App,
    private rest: RestProvider,
    public modalCtrl: ModalController,
    public http: HttpClient) {
    this.init();
  }

  ionViewDidLoad() {
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

  logout() {
    this.fb.logout().then(res => {
      console.log(res);
      this.storage.set('LOGGED_IN', false);
      MyApp.setNotifications = false;
      this.removeToken();
      this.app.getRootNav().setRoot(LoginPage);
    })
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
      this.fName = data['firstName'];
      this.lName = data['lastName'];
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

}
