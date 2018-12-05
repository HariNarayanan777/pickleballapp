import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, AlertController } from 'ionic-angular';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';
import { TabsPage } from '../tabs/tabs';
import { Storage } from '@ionic/storage';
import { RestProvider } from '../../providers/rest/rest';
import { HttpClient } from '@angular/common/http';
import { CreateAccountPage } from '../create-account/create-account';
import { AuthProvider } from '../../providers/auth/auth';
import * as moment from 'moment';



@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  fbLoginEndpoint: any = '/login-facebook';
  public email = "";
  public password = "";

  constructor(
    public navCtrl: NavController, public navParams: NavParams,
    private fb: Facebook, private storage: Storage,
    private rest: RestProvider, private platform: Platform,
    public alertCltr: AlertController, private http: HttpClient
  ) {
  }

  ionViewDidLoad() {
  }

  login() {
    if (this.platform.is("cordova")) {
      this.fb.login(['public_profile', 'email'])
        .then((res: FacebookLoginResponse) => this.handleLogin(res))
        .catch(e => console.log('Error logging into Facebook', e));
    } else
      this.loginInDebugNavigator();

  }

  public async LoginWithEmail() {
    if (this.email === "" || this.password === "") {
      this.alertCltr.create({
        title: "Empty Fields",
        buttons: ["OK"]
      })
        .present();
      return;
    }
    let login = await this.http.put("/login", { email: this.email, password: this.password }).toPromise();
    await AuthProvider.me.saveLoginUser(login);
  }

  handleLogin(res) {
    if (res.hasOwnProperty('status') && res.status == 'connected') {
      this.fb.api('me?fields=id,name,email,first_name,last_name,picture.width(720).height(720).as(picture_large)', []).then(profile => {
        let user = {
          "facebook": {
            "userID": res['authResponse']['userID'],
            "image": profile['picture_large']['data']['url']
          },
          "user": {
            "fullName": profile['first_name'] + ' ' + profile['last_name'],
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
      AuthProvider.me.saveLoginUser(result);
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
    await AuthProvider.me.saveLoginUser(user);
  }

  logout() {
    this.fb.logout().then(res => console.log(res))
  }

  public createAccount() {
    this.navCtrl.push(CreateAccountPage);
  }

  public getEmailForchangePassword() {
    this.alertCltr.create({
      inputs: [{ type: "email", label: "Email", placeholder: "Email", name: "email" }],
      buttons: ["Cancel", { text: "Ok", handler: this.IForgotPassword.bind(this) }]
    })
      .present();
  }

  private async IForgotPassword(data) {
    try {
      if (!data.email) return;
      let forgot = await this.http.put("/forgot-password", { email: data.email, dateTime: moment().toISOString() }).toPromise() as { msg: "not found" | "success" };
      if (forgot.msg === "not found") {
        this.alertCltr.create({
          message: "No user with that email was found",
          buttons: ["Ok"]
        })
          .present();
        return;
      }

      this.alertCltr.create({
        message: "Go to your email to change your email",
        buttons: ["Ok"]
      })
        .present();
    }
    catch (e) {
      console.error(e);
    }
  }
}
