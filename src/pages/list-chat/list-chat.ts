import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { ChatPage } from '../chat/chat';
import { ListFriendPage } from '../list-friend/list-friend';
import { AuthProvider } from '../../providers/auth/auth';
import { HelpersProvider } from '../../providers/helpers/helpers';

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

  async ionViewWillEnter() {
    let userID: any = await AuthProvider.me.getIdUser();
    let users = await this.http.get(`/list-chat/${userID}`).toPromise() as any[];
    this.users = users.map(user => {
      user.photo = HelpersProvider.me.getPhotoUrl(user, 1);
      return user;
    });
  }

  public errorImage(e) {
    e.target.src = "./assets/imgs/default-user.png";
  }

  public toChat(user) {
    this.navCtrl.push(ChatPage, { user });
  }

  public addChat() {
    this.navCtrl.push(ListFriendPage, { toChat: true }, { animation: "ios-transition" });
  }

}
