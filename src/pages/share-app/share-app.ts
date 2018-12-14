import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { AuthProvider } from '../../providers/auth/auth';


@IonicPage()
@Component({
  selector: 'page-share-app',
  templateUrl: 'share-app.html',
})
export class ShareAppPage {

  public email = "";

  constructor(
    public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient, public toastCtrl: ToastController
  ) {
  }

  ionViewDidLoad() {

  }

  public async share() {
    if (this.email === "") return;
    try {
      await this.http.post("/share-app", { email: this.email, idUser: await AuthProvider.me.getIdUser() }).toPromise();
      this.presentToast("An email has been sent to your friend to download Pickle Connect");
    }
    catch (e) {
      console.error(e);
    }
  }

  private presentToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000
    });
    toast.present();
  }

}
