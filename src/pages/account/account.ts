import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App } from 'ionic-angular';
import { Facebook } from '@ionic-native/facebook';
import { Storage } from '@ionic/storage';
import { LoginPage } from '../login/login';


@IonicPage()
@Component({
  selector: 'page-account',
  templateUrl: 'account.html',
})
export class AccountPage {

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private fb: Facebook,
    private storage: Storage,
    private app: App) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AccountPage');
  }

  logout(){
    this.fb.logout().then(res =>{ 
      console.log(res);
      this.storage.set('LOGGED_IN', false);
      this.app.getRootNav().setRoot(LoginPage);

    })
  }

}
