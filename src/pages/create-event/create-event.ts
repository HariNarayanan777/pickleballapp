import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { HttpClient } from '@angular/common/http';
import { SelectUsersPage } from '../select-users/select-users';
import { SelectPointMapPage } from '../select-point-map/select-point-map';
import { AuthProvider } from '../../providers/auth/auth';


@IonicPage()
@Component({
  selector: 'page-create-event',
  templateUrl: 'create-event.html',
})
export class CreateEventPage {

  public name = "";
  public description = "";
  public date = new Date();
  public time = new Date();
  public partner = "";
  public players = [];
  public courts = [];
  public matchTimes = "";
  public travelInfo = "";
  public eventStats = "";
  public type = "clinics";
  public userID = "";

  constructor(
    public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient, public modalCtrl: ModalController
  ) {
  }

  async ionViewDidLoad() {
    this.userID = await AuthProvider.me.getIdUser();
  }

  public setDate() {
    HelpersProvider.me.nativeDatePicker().then(date => {
      if (date) {
        this.date = date;
      }
    })
  }

  public setTime() {
    HelpersProvider.me.nativeTimePicker().then(time => {
      this.time = time;
    });
  }

  public getPlayers() {
    let mdl = this.modalCtrl.create(SelectUsersPage, { users: this.players });
    mdl.onDidDismiss(users => {
      if (users) this.players = users;
    });
    mdl.present();
  }

  public selectCourts() {
    let mdl = this.modalCtrl.create(SelectPointMapPage, { courts: this.courts });
    mdl.onDidDismiss(courts => {
      if (courts) this.courts = courts;
    });
    mdl.present();
  }

  public async save() {
    if (this.name === "") {
      return HelpersProvider.me.alertCtrl.create({
        message: "Required Field Name",
        buttons: ["Ok"]
      })
        .present();
    }
    try {
      let event: any = {
        name: this.name,
        description: this.description,
        date: this.date.getTime(),
        time: this.time.getTime(),
        partner: this.partner,
        players: this.players.map(it => { return it.id; }),
        courts: this.courts,
        matchTimes: this.matchTimes,
        travelInfo: this.travelInfo,
        eventStats: this.eventStats,
        type: this.type,
        user: this.userID
      };
      await this.http.post("/event-courts", { event }).toPromise();

      HelpersProvider.me.presentToast("Event Saved!");
      this.navCtrl.pop();
    }
    catch (e) {

    }
  }

}
