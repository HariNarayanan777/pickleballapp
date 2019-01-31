import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { HttpClient } from '@angular/common/http';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';

@IonicPage()
@Component({
  selector: 'page-share-event-friends',
  templateUrl: 'share-event-friends.html',
})
export class ShareEventFriendsPage {

  public allFriend = false;
  public onlyPlayers = false;
  public listFriend = [];
  public friendSelect = [];
  public comment = "";
  public event: any = {};

  constructor(
    public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient, public share: SocialSharing
  ) {
    this.event = this.navParams.get("event");
  }

  async ionViewDidLoad() {
    await this.getFriends();
  }

  async getFriends() {
    let userID: any = await AuthProvider.me.getIdUser();
    let query = { "or": [{ from: userID, response: true }, { to: userID, response: true }] };
    let users = await this.http.get(`/requestfriend?where=${JSON.stringify(query)}`).toPromise() as any[];
    this.listFriend = users.map(it => {
      let user;
      if (it.from.id === userID)
        user = it.to;
      else
        user = it.from;
      user.photo = this.validProperty(user.loginFacebook) === true ? user.loginFacebook.image : this.validProperty(user.image) === true ? user.image.src : "";
      user.requestID = it.id;
      return user;
    });
  }

  private validProperty(prop) {
    return prop !== undefined && prop !== null;
  }

  public errorImage(e) {
    e.target.src = "./assets/imgs/default-user.png";
  }

  public selectAll(r) {
    this.allFriend = r;
    if (this.allFriend === true)
      this.onlyPlayers = false;
  }

  public selectPlayers(r) {
    this.onlyPlayers = r;
    if (this.onlyPlayers === true)
      this.allFriend = false;
  }

  public isSelect(user) {
    if (this.allFriend === true) return true;
    //Si es por los players del evento tenemos que ver que esta en la lista
    //de players del evento
    if (this.onlyPlayers === true) {
      return this.event.players.findIndex(it => {
        return it.id === user.id;
      }) !== -1;
    }

    return this.friendSelect.findIndex(it => {
      return it.id === user.id;
    }) !== -1;
  }

  public addOrRemove(add: boolean, user) {
    this.allFriend = false;
    this.onlyPlayers = false;
    let index = this.friendSelect.findIndex(it => {
      return it.id === user.id;
    });
    if (add === true) {
      if (index === -1) this.friendSelect.push(user);
    } else {
      if (index !== -1) {
        if (this.friendSelect.length === 1)
          this.friendSelect = [];
        else
          this.friendSelect.splice(index, 1);
      }
    }
  }

  public async shareNative() { console.log(this.share);
    try {
      var options = {
        message: 'share this', // not supported on some apps (Facebook, Instagram)
        subject: 'the subject', // fi. for email
        files: ['', ''], // an array of filenames either locally or remotely
        url: 'https://www.website.com/foo/#bar?a=b',
        chooserTitle: 'Pick an app', // Android only, you can override the default share sheet title,
        appPackageName: 'com.apple.social.facebook' // Android only, you can provide id of the App you want to share with
      };
      this.share.shareWithOptions(options)
    } catch (error) {
      console.error(error);
    }
  }

  public async send() {
    let idUsers = [];
    if (this.allFriend === true) {
      idUsers = this.listFriend.map(it => {
        return it.id;
      });
    } else if (this.onlyPlayers === true) {
      idUsers = this.event.players.map(it => {
        return it.id;
      });
    } else {
      idUsers = this.friendSelect.map(it => {
        return it.id;
      });
    }

    let shares = {
      idUsers,
      event: this.event,
      comment: this.comment
    };
    await this.http.patch("/share-event", shares).toPromise();
    HelpersProvider.me.presentToast("Event Shared!");
    this.navCtrl.pop();
  }

}
