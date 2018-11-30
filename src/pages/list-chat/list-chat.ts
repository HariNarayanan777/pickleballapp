import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';

@IonicPage()
@Component({
  selector: 'page-list-chat',
  templateUrl: 'list-chat.html',
})
export class ListChatPage {

  public users = [];

  constructor(
    public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient, private storage: Storage
  ) {
  }

  async ionViewDidLoad() {
    let userID: any = await this.storage.get("USER_ID");
    let query = { "or": [{ from: userID }, { to: userID }] };
    this.users = await this.http.get(`/requestfriend?where=${JSON.stringify(query)}`).toPromise() as any[];
  }

}
