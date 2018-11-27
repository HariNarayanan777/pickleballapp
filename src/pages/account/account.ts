import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App, ModalController } from 'ionic-angular';
import { Facebook } from '@ionic-native/facebook';
import { Storage } from '@ionic/storage';
import { LoginPage } from '../login/login';
import { RestProvider } from '../../providers/rest/rest';
import { UpdateAccountPage } from '../update-account/update-account';


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


  constructor(public navCtrl: NavController, public navParams: NavParams,
    private fb: Facebook,
    private storage: Storage,
    private app: App,
    private rest: RestProvider,
    public modalCtrl: ModalController) {
      this.init();
  }

  ionViewDidLoad() {
  }

  init(){
    this.getProfileImage();
      this.storage.get('USER_ID').then(res => {
        this.userID = res;
        this.getProfile();

      });
  }

  getProfileImage(){
    this.fb.api('me?fields=picture.width(720).height(720).as(picture_large)', []).then(picture => {
      this.profileImg = picture['picture_large']['data']['url'];
    })
  }

  logout(){
    this.fb.logout().then(res =>{ 
      console.log(res);
      this.storage.set('LOGGED_IN', false);
      this.app.getRootNav().setRoot(LoginPage);

    })
  }

  getProfile(){
    this.rest.getData('/user/' + this.userID).subscribe(data => {
      this.fName = data['firstName'];
      this.lName = data['lastName'];
      this.email = data['email'];
      this.zipcode = data['zipCode'];
    });

  }

  presentModal() {
    const modal = this.modalCtrl.create(UpdateAccountPage);
    modal.onDidDismiss(data => {
      if(data['updated'] == true){
        this.init();
      }
    });
    modal.present();
  }

}
