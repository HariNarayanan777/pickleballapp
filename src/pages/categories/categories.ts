import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { RestProvider } from '../../providers/rest/rest';
import { Storage } from '@ionic/storage';
import { LiveComunicationProvider } from '../../providers/live-comunication/live-comunication';
import { ListChatPage } from '../list-chat/list-chat';
import { ChatPage } from '../chat/chat';



@IonicPage()
@Component({
  selector: 'page-categories',
  templateUrl: 'categories.html',
})
export class CategoriesPage {
  userID: any;
  notifications: any = [];
  disable: boolean = false;
  public skip = 0;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private rest: RestProvider, private storage: Storage, private toastCtrl: ToastController) {
  }

  async ionViewWillEnter() {
    let _div = document.getElementById("notification-rst")
    if (_div !== null) {
      _div.parentElement.removeChild(_div);
    }
    this.userID = await this.storage.get("USER_ID");
    this.getNotifications();
  }

  ionViewDidLoad() {
  }

  getNotifications(infiniteScroll?) {
    let query = {
      or: [
        { user: this.userID, type: "chat" },
        { user: this.userID, type: "acceptFriend" },
        { user: this.userID, type: "requestFriend" }
      ]
    };
    this.rest.getData(`/notifications?where=${JSON.stringify(query)}&sort=createdAt DESC&limit=10&skip=${this.skip}`).subscribe(res => {
      let rsts: any = res; console.log(rsts);
      if (rsts.length > 0) {
        this.notifications = this.notifications.concat(rsts);
        this.skip += 10;
      }

      if (infiniteScroll)
        infiniteScroll.complete();
    })
  }

  public existImage(user) {
    let photo = this.validProperty(user.loginFacebook) === true ? user.loginFacebook.image : this.validProperty(user.image) === true ? user.image.src : "";
    return photo !== "";
  }

  public errorImage(e) {
    e.target.src = "./assets/imgs/default-user.png";
  }

  public getImage(user) {
    return this.validProperty(user.loginFacebook) === true ? user.loginFacebook.image : this.validProperty(user.image) === true ? user.image.src : "";
  }

  private validProperty(prop) {
    return prop !== undefined && prop !== null;
  }

  responseRequest(noti, response) {
    var card = document.getElementById('noti-' + noti['id']);
    const btns = Array.from(card.querySelectorAll('button'));

    this.disable = true;
    let d = new Date();
    let n = d.toISOString();
    let payload = {
      response: response,
      dateOfResponse: n,
      id: noti.data.id
    }

    console.log(payload);
    this.rest.patchData(`/requestfriend/${noti.data.id}`, payload).subscribe(res => {
      console.log("Noti", res);

      btns.forEach(btn => {
        btn.style.display = 'none';
      });
      if (response == true) {
        this.presentToast('You and ' + noti['data']['from']['fullName'] + ' are friends now.');
      }
      this.disable = false;
      card.style.backgroundColor = 'lightgray';
      this.updateNotiStatus(noti);

    })
  }

  presentToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000
    });
    toast.present();
  }

  updateNotiStatus(noti) {
    let payload = {
      view: true
    }
    this.rest.patchData(`/notifications/${noti.id}`, payload).subscribe(res => console.log(res))
  }

  public toChat(user) {
    this.navCtrl.push(ChatPage, { user });
  }
}
