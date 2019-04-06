import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { RestProvider } from '../../providers/rest/rest';
import { ChatPage } from '../chat/chat';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { HttpClient } from '@angular/common/http';
import { AuthProvider } from '../../providers/auth/auth';


@IonicPage()
@Component({
  selector: 'page-public-profile',
  templateUrl: 'public-profile.html',
})
export class PublicProfilePage {
  profileImg: any;
  userID: any;
  fullName: any;
  email: any;
  rank: any;
  user: any;
  public location = "";
  public isFriend = true;
  public requests = [];
  public requestValid: any = {};
  constructor(public navCtrl: NavController, public navParams: NavParams,
    private rest: RestProvider, public http: HttpClient
  ) {
    this.userID = navParams.get('userID');
    console.log(this.userID);
    this.getProfile();
  }

  async ionViewDidLoad() {
    let userID: any = await AuthProvider.me.getIdUser();
    let query: any = { "or": [{ from: userID, response: true, to: this.userID }, { to: userID, from: this.userID, response: true }] };
    let users = await this.http.get(`/requestfriend?where=${JSON.stringify(query)}`).toPromise() as any[];
    if (users.length > 0) {
      this.isFriend = true;
      this.requestValid = users[0];
    } else
      this.isFriend = false;

    query = { "or": [{ from: userID, to: this.userID }, { to: userID, from: this.userID, }] };
    this.requests = await this.http.get(`/requestfriend?where=${JSON.stringify(query)}`).toPromise() as any[];
  }

  public sendRequestAllow() {
    if (this.requests.length === 0) return true;
    let indexResponseTrue = this.requests.findIndex(it => {
      if (it.response === true || it.response === null) return true;
      return false;
    });
    console.log("all", indexResponseTrue);
    return indexResponseTrue === -1;
  }

  public async addFriend() {
    let userID: any = await AuthProvider.me.getIdUser();
    let payload = {
      to: this.userID,
      from: userID
    }
    this.rest.postData('/requestfriend', payload).subscribe(res => {
      console.log("Request", res);
      this.ionViewDidLoad();
    })
  }

  cancelRequest() {
    this.rest.removeData('/requestfriend/' + this.requestValid['id']).subscribe(res => {
      this.ionViewDidLoad();
    })
  }

  getProfile() {
    this.rest.getData('/user/' + this.userID).subscribe(data => {
      console.log(data);
      this.user = data;
      this.fullName = data['fullName'];
      this.email = data['email'];
      this.rank = data['rank'];
      this.location = data["location"] || "";
      this.profileImg = HelpersProvider.me.getPhotoUrl(data, 2);
    });

  }

  public async toChatView() {
    this.navCtrl.push(ChatPage, { 'user': this.user }, { animation: "ios-transition" });
  }

  public formatNumber(n){
    return (parseFloat(n) as any).toFixed("1");
  }
}
