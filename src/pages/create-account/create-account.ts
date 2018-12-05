import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { AuthProvider } from '../../providers/auth/auth';
import * as moment from 'moment';

@IonicPage()
@Component({
  selector: 'page-create-account',
  templateUrl: 'create-account.html',
})
export class CreateAccountPage {

  public fullName = "";
  public email = "";
  public password = "";
  public birthDay = "";
  public genere = "";

  constructor(
    public navCtrl: NavController, public navParams: NavParams,
    public alertCtrl: AlertController, public http: HttpClient,
    private storage: Storage
  ) {
  }

  async ionViewDidLoad() {
  }

  private validEmail(email: string): boolean {
    return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/.test(email);
  }

  public async createAccount() {
    try {
      if (
        this.email === "" ||
        this.password === "" ||
        this.fullName === ""
      ) {
        this.alertCtrl.create({
          title: "Empty Fields",
          buttons: ["OK"]
        })
          .present();
        return;
      }

      if (this.validEmail(this.email) === false) {
        this.alertCtrl.create({
          title: "Email with invalid format",
          buttons: ["OK"]
        })
          .present();
        return;
      }
      
      let user: any = {
        fullName: this.fullName,
        email: this.email,
        password: this.password,
        birthDay: this.birthDay !== '' ? moment(this.birthDay, 'YYYY/MM/DD').toISOString() : '',
        genere: this.genere
      };
      user = await this.http.post("/signup", user).toPromise();
      AuthProvider.me.saveLoginUser(user);
    }
    catch (e) {
      console.error(e);
    }
  }

}
