import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { HttpClient } from '@angular/common/http';
import { SelectUsersPage } from '../select-users/select-users';
import { SelectPointMapPage } from '../select-point-map/select-point-map';
import { AuthProvider } from '../../providers/auth/auth';
import { DomSanitizer } from '@angular/platform-browser';

declare var google: any;

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
  public locationText = "";
  public locationCoords = [];
  public partner = "";
  public players = [];
  public courts = [];
  public matchTimes = "";
  public travelInfo = "";
  public eventStats = "";
  public type = "clinics";
  public userID = "";
  public imgs = [
    { url: "./assets/imgs/camera-default.png", file: new File([], "") },
    { url: "./assets/imgs/camera-default.png", file: new File([], "") },
    { url: "./assets/imgs/camera-default.png", file: new File([], "") }
  ];

  constructor(
    public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient, public modalCtrl: ModalController,
    public domSanitizationService: DomSanitizer
  ) {
  }

  async ionViewDidLoad() {
    this.userID = await AuthProvider.me.getIdUser();
    let input = function () { return document.querySelector("#location-event input"); };
    let autocomplete = new google.maps.places.Autocomplete(input());
    google.maps.event.addListener(autocomplete, 'place_changed', () => {
      var address = (input() as any).value;
      this.getCoords(address);
    });
  }

  private getCoords(address: string) {
    let geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address }, (res, status) => {

      if (Object.prototype.toString.call(res) === "[object Array]") {
        if (res.length === 0) return;
        res = res[0];
      }

      if (res.geometry) {
        this.locationText = address;
        this.locationCoords = [res.geometry.location.lng(), res.geometry.location.lat()]
      }
    });
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

  public async changePhoto(ind) {
    let b64 = await HelpersProvider.me.Camera({}, false);
    let blob = HelpersProvider.me.b64toBlob(b64, "image/jpeg");
    let file = HelpersProvider.me.blobToFile(blob, "image");
    let url = URL.createObjectURL(file);
    this.imgs[ind] = { url, file };
  }

  public async save() {
    if (this.name === "") {
      return HelpersProvider.me.alertCtrl.create({
        message: "Required Field Name",
        buttons: ["Ok"]
      })
        .present();
    }
    if (this.locationText === "") {
      return HelpersProvider.me.alertCtrl.create({
        message: "Required Field Location",
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
        locationCoords: this.locationCoords,
        locationText: this.locationText,
        type: this.type,
        user: this.userID
      };
      let e = await this.http.post("/event-courts", { event }).toPromise();
      this.sendImages(e);
      HelpersProvider.me.presentToast("Event Saved!");
      this.navCtrl.pop();
    }
    catch (e) {

    }
  }

  public async sendImages(event) {
    try {
      let data = new FormData();
      for (let img of this.imgs) {
        data.append("images", img.file);
      }
      let t = await this.http.post("/event-images/" + event.id, data).toPromise();
    }
    catch (e) {
      console.error(e);
    }
  }

}
