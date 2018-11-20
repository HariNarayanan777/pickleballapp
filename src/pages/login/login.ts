import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';
import { TabsPage } from '../tabs/tabs';
import { Storage } from '@ionic/storage';



@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  constructor(public navCtrl: NavController,
     public navParams: NavParams,
     private fb: Facebook,
     private storage: Storage) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }

  login(){
    this.fb.login(['public_profile', 'user_friends', 'email'])
  .then((res: FacebookLoginResponse) => this.handleLogin(res))
  .catch(e => console.log('Error logging into Facebook', e));
  }
  handleLogin(res){
    console.log(res);
    if(res.hasOwnProperty('status') && res.status == 'connected'){
      this.storage.set('LOGGED_IN', true);
      this.navCtrl.setRoot(TabsPage);
    }
  }

  logout(){
    this.fb.logout().then(res => console.log(res))
  }
}
