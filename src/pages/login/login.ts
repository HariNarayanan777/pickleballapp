import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';
import { TabsPage } from '../tabs/tabs';
import { Storage } from '@ionic/storage';
import { RestProvider } from '../../providers/rest/rest';



@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  fbLoginEndpoint:any = '/login-facebook';

  constructor(public navCtrl: NavController,
     public navParams: NavParams,
     private fb: Facebook,
     private storage: Storage,
     private rest: RestProvider) {
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
    if(res.hasOwnProperty('status') && res.status == 'connected'){
      this.fb.api('me?fields=id,name,email,first_name,last_name,picture.width(720).height(720).as(picture_large)', []).then(profile => {
        let user = {
          "facebook": {
              "userID": res['authResponse']['userID']
          },
          "user": {
              "firstName": profile['first_name'],
              "lastName":  profile['last_name'],
              "zipCode": "",
              "rank": 0,
              "email": profile['email']
          }
      }
      this.saveInAPI(user);
      });      
     
    }
  }


  saveInAPI(res){
    this.rest.putData(this.fbLoginEndpoint, res).subscribe(result => {
      this.storage.set('USER_ID', result['id']);
      this.storage.set('LOGGED_IN', true);
      this.navCtrl.setRoot(TabsPage);
    })
  }

  logout(){
    this.fb.logout().then(res => console.log(res))
  }
}
