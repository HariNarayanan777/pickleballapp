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

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private rest: RestProvider, private storage: Storage, private toastCtrl: ToastController) {
    this.storage.get('USER_ID').then(res => {
      this.userID = res;
      this.getNotifications();

    });
  }

  ionViewDidLoad() {
    LiveComunicationProvider.eventsNotifications.onNoti = async function (notification) {
      await this.navCtrl.setRoot(ListChatPage)
      this.navCtrl.push(ChatPage, { user: notification.from })
    }.bind(this);
  }

  getNotifications() {
    this.rest.getData(`/notifications?where={"user":"${this.userID}"}`).subscribe(res => {
      console.log(res);
      this.notifications = res;
    })
  }

  public existImage(user) {
    let photo = this.validProperty(user.loginFacebook) === true ? user.loginFacebook.image : this.validProperty(user.image) === true ? user.image.src : "";
    return photo !== "";
  }

  public getImage(user){
    return  this.validProperty(user.loginFacebook) === true ? user.loginFacebook.image : this.validProperty(user.image) === true ? user.image.src : "";
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
