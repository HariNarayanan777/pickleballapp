import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { RestProvider } from '../../providers/rest/rest';
import { Storage } from '@ionic/storage';



@IonicPage()
@Component({
  selector: 'page-categories',
  templateUrl: 'categories.html',
})
export class CategoriesPage {
  userID:any;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private rest: RestProvider, private storage: Storage) {
      this.storage.get('USER_ID').then(res => {
        this.userID = res;
        this.getNotifications();
  
      });
  }

  ionViewDidLoad() {
  }

  getNotifications(){
    this.rest.getData(`/notification?where={"user":"${this.userID}"}`).subscribe(res => {
      console.log(res);
    })
  }

}
