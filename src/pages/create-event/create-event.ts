import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { HttpClient } from '@angular/common/http';


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
  public player = "";
  public courts = "";
  public matchTimes = "";
  public travelInfo = "";
  public eventStats = "";
  public type = "clinics";

  constructor(
    public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient
  ) {
  }

  async ionViewDidLoad() {

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

  public async save() {
    if (this.name === "") {
      return HelpersProvider.me.alertCtrl.create({
        message: "Required Field Name",
        buttons: ["Ok"]
      })
        .present();
    }
    try {
      let event = {
        name: this.name,
        description: this.description,
        date: this.date.toISOString(),
        time: this.time.toISOString(),
        partner: this.partner,
        player: this.player,
        courts: this.courts,
        matchTimes: this.matchTimes,
        travelInfo: this.travelInfo,
        eventStats: this.eventStats,
        type: this.type
      };
      await this.http.post("/event", event).toPromise();
      HelpersProvider.me.presentToast("Event Saved!");
      this.navCtrl.pop();
    }
    catch (e) {

    }
  }

}
