import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, ActionSheetController } from 'ionic-angular';
import { FormControl } from '@angular/forms';
import { RestProvider } from '../../providers/rest/rest';
import { Storage } from '@ionic/storage';


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

  constructor(public navCtrl: NavController, public navParams: NavParams, private rest: RestProvider, private storage: Storage,
    public toastCtrl: ToastController, public actionSheetCtrl: ActionSheetController) {
    this.searchControl = new FormControl();
    this.storage.get('USER_ID').then(res => {
      this.userID = res;
    });

  }

  ionViewDidLoad() {
    this.searching = false;
    this.shouldShowCancel = false;
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
        console.log("Result", result);
        this.players = result;

      },
      err => {
        console.error("Error : " + err);
      });
  }

  cancel() {
    this.searching = false;
  }

  checkFriendRequest(player, $event) {
    this.disable = true;
    if (typeof player['requests'] !== 'undefined' && player['requests'].length > 0) {
      this.cancelRequestActionSheet(player, $event);
    } else {
      this.addFriend(player, $event);
    }
  }

  addFriend(player, $event) {
    let payload = {
      from: this.userID,
      to: player['_id']
    }
    this.rest.postData('/requestfriend', payload).subscribe(res => {
      console.log("Request", res);
      $event.srcElement.innerText = 'Cancel Request';
      this.presentToast("Friendship Request sent!");
      this.disable = false;
    })
  }

  presentToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000
    });
    toast.present();
  }

  cancelRequestActionSheet(player, $event) {
    const actionSheet = this.actionSheetCtrl.create({
      title: 'Modify your album',
      buttons: [
        {
          text: 'Cancel Request',
          role: 'destructive',
          handler: () => {
            console.log('Destructive clicked');
            this.cancelRequest(player, $event);
          }
        }, {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    actionSheet.present();
  }

  cancelRequest(player, $event) {
    this.rest.removeData('/requestfriend/' + player['requests'][0]['id']).subscribe(res => {
      console.log("Cancel Request", res);
      $event.srcElement.innerText = 'Add Friend';
      this.presentToast("Friendship Request cancelled!");
      this.disable = false;
    })
  }
}
