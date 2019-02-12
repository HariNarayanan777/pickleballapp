import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { RestProvider } from '../../providers/rest/rest';
import { ChatPage } from '../chat/chat';


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
      if(data['loginFacebook'] !== null && data['loginFacebook'] !== undefined){
        this.profileImg = `https://graph.facebook.com/${data['loginFacebook']['userID']}/picture?type=large&width=720&height=720`
      }else if(data['image'] !== null && data['image'] !== undefined){
        this.profileImg = data['image']['src'];
      }else
        this.profileImg = 'assets/imgs/default-user.png';
    });

  }

  public async toChatView() {
    this.navCtrl.push(ChatPage, { 'user': this.user }, { animation: "ios-transition" });
  }
}
