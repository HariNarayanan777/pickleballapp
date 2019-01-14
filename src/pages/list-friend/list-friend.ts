import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { AuthProvider } from '../../providers/auth/auth';
import { ChatPage } from '../chat/chat';

@IonicPage()
@Component({
  selector: 'page-list-friend',
  templateUrl: 'list-friend.html',
})
export class ListFriendPage {

  public list = [];
  public searchTerm = "";
  public toChat = false;

  constructor(
    public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient
  ) {
    this.getFriends();
    if (this.navParams.get("toChat") !== undefined) {
      this.toChat = true;
    }
  }

  public onSearchInput() { }

  public validFiltro(user) {
    if (this.searchTerm === "") return true;
    return user.fullName.toLowerCase().includes(this.searchTerm.toLowerCase());
  }

  async getFriends() {
    let userID: any = await AuthProvider.me.getIdUser();
    let query = { "or": [{ from: userID, response: true }, { to: userID, response: true }] };
    let users = await this.http.get(`/requestfriend?where=${JSON.stringify(query)}`).toPromise() as any[];
    console.log("que pasa", users);
    this.list = users.map(it => {
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

  public async deleteFriend(user) {
    try {
      await this.http.delete(`/requestfriend/${user.requestID}`).toPromise();
      await this.getFriends();
    }
    catch (e) {
      console.error(e);
    }
  }

  public async toChatView(user) {
    if (this.toChat === false) return;
    await this.navCtrl.pop({ animation: "ios-transition" });
    this.navCtrl.push(ChatPage, { user }, { animation: "ios-transition" });
  }

}
