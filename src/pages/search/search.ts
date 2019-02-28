import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, ActionSheetController } from 'ionic-angular';
import { FormControl } from '@angular/forms';
import { RestProvider } from '../../providers/rest/rest';
import { Storage } from '@ionic/storage';
import { Push } from '@ionic-native/push';
import { PublicProfilePage } from '../public-profile/public-profile';
import { HelpersProvider } from '../../providers/helpers/helpers';


@IonicPage()
@Component({
  selector: 'page-search',
  templateUrl: 'search.html',
})
export class SearchPage {
  searching: any = false;
  shouldShowCancel: any = false;
  searchTerm: string = '';
  searchControl: FormControl;
  public players: any = [];
  userID: any;
  disable: boolean = false;
  public people: any = {};
  public selectUser = false;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private rest: RestProvider, private storage: Storage,
    public toastCtrl: ToastController, public actionSheetCtrl: ActionSheetController) {
    this.searchControl = new FormControl();
  }

  async ionViewWillEnter() {
    this.onSearchInput();
  }

  async ionViewDidLoad() {
    this.userID = await this.storage.get('USER_ID');
    this.searching = false;
    this.shouldShowCancel = false;
  }

  public errorImage(e) {
    e.target.src = "./assets/imgs/default-user.png";
  }

  public getUrlImage(player) {
    return HelpersProvider.me.getPhotoUrl(player);
  }

  onSearchInput() {
    console.log(this.searchTerm);
    if (this.searchTerm === "") {
      this.searching = false;
      this.shouldShowCancel = false;
    } else {
      this.searching = true;
      this.shouldShowCancel = true;
      this.getdata();
    }

  }

  getdata() {
    this.rest.getData(`/users/finds/${this.userID}?name=${this.searchTerm}`).subscribe(
      result => {
        this.players = result;
      },
      err => {
        console.error("Error : " + err);
      });
  }

  cancel() {
    this.searching = false;
    this.players = [];
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


  //#region para mostrar un usario en misma pantalla si es necesario
  goToFriendProfile(userID) {
    if (window.innerWidth <= 720) {
      this.navCtrl.push(PublicProfilePage, { 'userID': userID });
      return;
    }
    this.rest.getData('/user/' + userID).subscribe(data => {
      console.log(data);
      this.selectUser = true;
      this.people = data;
      this.people.profileImg = HelpersProvider.me.getPhotoUrl(data);
    });

  }

  //#endregion
}
