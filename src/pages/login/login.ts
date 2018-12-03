import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, AlertController } from 'ionic-angular';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';
import { TabsPage } from '../tabs/tabs';
import { Storage } from '@ionic/storage';
import { RestProvider } from '../../providers/rest/rest';
import { HttpClient } from '@angular/common/http';



@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  fbLoginEndpoint: any = '/login-facebook';

  constructor(
    public navCtrl: NavController, public navParams: NavParams,
    private fb: Facebook, private storage: Storage,
    private rest: RestProvider, private platform: Platform,
    public alertCltr: AlertController, private http: HttpClient
  ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }

  login() {
    if (this.platform.is("cordova")) {
      this.fb.login(['public_profile', 'user_friends', 'email'])
        .then((res: FacebookLoginResponse) => this.handleLogin(res))
        .catch(e => console.log('Error logging into Facebook', e));
    } else
      this.loginInDebugNavigator();

  }
  handleLogin(res) {
    if (res.hasOwnProperty('status') && res.status == 'connected') {
      this.fb.api('me?fields=id,name,email,first_name,last_name,picture.width(720).height(720).as(picture_large)', []).then(profile => {
        let user = {
          "facebook": {
            "userID": res['authResponse']['userID']
          },
          "user": {
            "firstName": profile['first_name'],
            "lastName": profile['last_name'],
            "zipCode": "",
            "rank": 0,
            "email": profile['email']
          }
        }
        this.saveInAPI(user);
      });

    }
  }


  saveInAPI(res) {
    this.rest.putData(this.fbLoginEndpoint, res).subscribe(result => {
      this.storage.set('USER_ID', result['id']);
      this.storage.set('LOGGED_IN', true);
      this.navCtrl.setRoot(TabsPage);
    })
  }

  private loginInDebugNavigator() {
    let panel = this.alertCltr.create({
      message: "id", inputs: [{ type: "text", name: "id" }],
      buttons: [{ text: "Ok", handler: this.loginDebug.bind(this) }]
    });
    panel.present();
  }

  private async loginDebug(data) {
    let id = data.id || "";
    let user = await this.http.get("/user/" + id).toPromise();
    this.storage.set('USER_ID', user['id']);
    this.storage.set('LOGGED_IN', true);
    this.navCtrl.setRoot(TabsPage);
  }

  logout() {
    this.fb.logout().then(res => console.log(res))
  }
}
