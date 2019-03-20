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
  userID: any;
  fName: any;
  lName: any;
  public fname = "";
  email: any;
  zipcode: any;
  profile: any;
  searchable: any;
  level: number = 1;
  showPosition = true;

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController,
    private storage: Storage,
    private rest: RestProvider) {
    this.storage.get('USER_ID').then(res => {
      this.userID = res;
      this.getProfile();
    });
  }



  getProfile() {
    this.rest.getData('/user/' + this.userID).subscribe(data => {
      this.profile = data;
      console.log(data);
      this.fname = data["fullName"];
      this.email = data['email'];
      this.zipcode = data['zipCode'];
      this.searchable = data['searchable'];
      this.level = data["rank"];
      this.showPosition = data["showPosition"];
    });

  }

  updateAccount() {
    this.profile['fullName'] = this.fname;
    this.profile['email'] = this.email;
    this.profile['zipCode'] = this.zipcode;
    this.profile['searchable'] = this.searchable;
    this.profile['rank'] = this.level;
    this.profile['showPosition'] = this.showPosition;
    let profile = JSON.parse( JSON.stringify(this.profile) );
    delete profile["eventsPlayer"];
    this.rest.putData('/user/' + this.userID, profile).subscribe(result => {
      console.log("Update", result);
      let data = { 'updated': true }
      this.viewCtrl.dismiss(data);
    })
  }

  dismiss() {
    let data = { 'updated': false }
    this.viewCtrl.dismiss(data);
  }

}
