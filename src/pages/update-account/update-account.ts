import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { RestProvider } from '../../providers/rest/rest';
import { Storage } from '@ionic/storage';


@IonicPage()
@Component({
  selector: 'page-update-account',
  templateUrl: 'update-account.html',
})
export class UpdateAccountPage {
  userID:any;
  fName:any;
  lName:any;
  email:any;
  zipcode:any;
  profile:any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl:ViewController,
    private storage: Storage,
    private rest: RestProvider) {
      this.storage.get('USER_ID').then(res => {
        this.userID = res;
        this.getProfile();

      });
  }

  

  getProfile(){
    this.rest.getData('/user/' + this.userID).subscribe(data => {
      this.profile = data;
      this.fName = data['firstName'];
      this.lName = data['lastName'];
      this.email = data['email'];
      this.zipcode = data['zipCode'];
    });

  }

  updateAccount(){
   this.profile['firstName'] = this.fName;
   this.profile['lastName'] = this.lName;
   this.profile['email'] = this.email;
   this.profile['zipCode'] = this.zipcode;
   this.rest.putData('/user/' + this.userID, this.profile).subscribe(result =>{
      console.log("Update", result);
      let data = {'updated': true}
      this.viewCtrl.dismiss(data);
   })
  }

  dismiss() {
    let data = {'updated': false}
    this.viewCtrl.dismiss(data);
  }

}
