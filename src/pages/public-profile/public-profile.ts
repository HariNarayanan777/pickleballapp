import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { RestProvider } from '../../providers/rest/rest';
import { ChatPage } from '../chat/chat';
import { HelpersProvider } from '../../providers/helpers/helpers';


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
  user:any;
  public location = "";

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private rest: RestProvider
    ) {
      this.userID = navParams.get('userID');
      console.log(this.userID);
      this.getProfile();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PublicProfilePage');
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
}
