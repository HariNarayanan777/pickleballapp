import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController, ToastController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { AuthProvider } from '../../providers/auth/auth';
import { RestProvider } from '../../providers/rest/rest';
import { PublicProfilePage } from '../public-profile/public-profile';
import { HelpersProvider } from '../../providers/helpers/helpers';

@IonicPage()
@Component({
  selector: 'page-list-friend',
  templateUrl: 'list-friend.html',
})
export class ListFriendPage {

  public list = [];
  public searchTerm = "";
  public toChat = false;
  public listPeople = [];
  public userID = "";

  constructor(
    public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient, private rest: RestProvider,
    public actionSheetCtrl: ActionSheetController, public toastCtrl: ToastController
  ) {
    this.getFriends();
    if (this.navParams.get("toChat") !== undefined) {
      this.toChat = true;
    }
  }

  async ionViewDidLoad() {
    this.userID = await AuthProvider.me.getIdUser();
  }

  public errorImage(e) {
    e.target.src = "./assets/imgs/default-user-2.png";
  }



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
      user.photo = HelpersProvider.me.getPhotoUrl(user);
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
  }

  //#region encontrar nuevas personas

  public onSearchInput() {
    console.log(this.searchTerm);
    if (this.searchTerm === "") {
    } else {
      this.rest.getData(`/users/finds/${this.userID}?name=${this.searchTerm}`).subscribe(
        result => {
          let listPeople = result as any[];
          this.listPeople = listPeople.map(it => {
            it.photo = HelpersProvider.me.getPhotoUrl(it);
            return it;
          });
        },
        err => {
          console.error("Error : " + err);
        });
    }
  }

  checkFriendRequest(player, $event) {
    if (this.sendRequestAllow(player) === true) {
      this.addFriend(player, $event);
    }
    let index = player.requests.findIndex(it => {
      if (it.response === null) return true;
      return false;
    });
    if (index !== -1)
      this.cancelRequestActionSheet($event, player.requests[index]);
  }

  public addFriend(player, $event) {
    let payload = {
      from: this.userID,
      to: player['_id']
    }
    this.rest.postData('/requestfriend', payload).subscribe(res => {
      console.log("Request", res);
      $event.srcElement.innerText = 'Cancel Request';
      this.presentToast("Friendship Request sent!");
      this.onSearchInput();
    })
  }

  presentToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000
    });
    toast.present();
  }

  public sendRequestAllow(user) {
    if (user.requests.length === 0) return true;
    let indexResponseTrue = user.requests.findIndex(it => {
      if (it.response === true || it.response === null) return true;
      return false;
    });
    console.log("all", indexResponseTrue);
    return indexResponseTrue === -1;
  }

  public isFriend(user) {
    let isFriend = false;
    for (let request of user.requests) {
      if (request.response === true) {
        isFriend = true;
        break;
      }

    }

    return !isFriend;
  }

  cancelRequestActionSheet($event, request) {
    const actionSheet = this.actionSheetCtrl.create({
      title: 'Cancel Request?',
      buttons: [
        {
          text: 'Yes',
          role: 'destructive',
          handler: () => {
            console.log('Destructive clicked');
            this.cancelRequest($event, request);
          }
        }, {
          text: 'No',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    actionSheet.present();
  }

  cancelRequest($event, request) {
    this.rest.removeData('/requestfriend/' + request['id']).subscribe(res => {
      this.onSearchInput();
      $event.srcElement.innerText = 'Add Friend';
      this.presentToast("Friendship Request cancelled!");
      this.onSearchInput();
    })
  }

  goToFriendProfile(userID) {
    this.navCtrl.push(PublicProfilePage, { 'userID': userID });
  }

  //#endregion
}
