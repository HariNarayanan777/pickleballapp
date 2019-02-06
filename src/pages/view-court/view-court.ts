import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, ViewController } from 'ionic-angular';
import * as moment from "moment";
import { AuthProvider } from '../../providers/auth/auth';
import { HttpClient } from '@angular/common/http';

declare var google;

@IonicPage()
@Component({
  selector: 'page-view-court',
  templateUrl: 'view-court.html',
})
export class ViewCourtPage {

  public court: any = {};
  public map: any = {};
  public courstSaved = [];
  public orderXSkill: { skill: number, users: any[] }[] = [];

  constructor(
    public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient, public toastCtrl: ToastController,
    public viewCtrl: ViewController
  ) {
    this.court = this.navParams.get("court");
    // console.log(this.court);
  }

  async ionViewDidLoad() {
    this.getCourtsSaved();
    let mapOptions: any = {
      center: {
        lat: this.court.lat,
        lng: this.court.lng
      },
      zoom: 12
    };

    this.map = new google.maps.Map(document.getElementById("map_court"), mapOptions);

    let image = {
      url: './assets/imgs/icon-marker-default.png',
      // This marker is 20 pixels wide by 32 pixels high.
      size: new google.maps.Size(30, 59),
      // The origin for this image is (0, 0).
      origin: new google.maps.Point(0, 0),
      // The anchor for this image is the base of the flagpole at (0, 32).
      anchor: new google.maps.Point(15, 59)
    };

    new google.maps.Marker({
      animation: 'DROP',
      position: {
        lat: this.court.lat,
        lng: this.court.lng
      },
      map: this.map,
      icon: image
    });

  }

  public dateToFormat(date) {
    return moment(date).format("ddd DD/MM/YYYY");
  }

  public saveOrRemove() {
    if (this.isSavedCourt(this.court).saved === true) {
      this.removeCourt(this.court);
    } else {
      this.save(this.court);
    }
  }

  public async save(court) {
    if (court.lng !== null && court.lng !== undefined &&
      court.lat !== null && court.lat !== undefined) {
      try {
        let user = await AuthProvider.me.getIdUser();
        let ite = JSON.parse(JSON.stringify(court));
        ite.coordinates = [ite.lng, ite.lat];
        delete ite.lng;
        delete ite.lat;
        ite.user = user;
        await this.http.post("/court", ite).toPromise();
        this.presentToast("Saved Court");
        await this.getCourtsSaved();
      }
      catch (e) {
        console.error(e);
      }
    }
  }

  public async removeCourt(court) {
    let pos = await this.isSavedCourt(court);
    if (pos.saved === true) {
      await this.http.delete(`/court/${this.courstSaved[pos.index].id}`).toPromise();
      this.presentToast("Courst Removed");
      await this.getCourtsSaved();
    }
  }

  private async getCourtsSaved() {
    let user = await AuthProvider.me.getIdUser();
    let query = { user };
    this.courstSaved = await this.http.get(`/court?where=${JSON.stringify(query)}&limit=40000`).toPromise() as any[];
    for (let user of this.court.users) {
      let index = this.orderXSkill.findIndex(it => {
        return it.skill = user.rank;
      });
      if (index !== -1)
        this.orderXSkill[index].users.push(user);
      else
        this.orderXSkill.push({ skill: user.rank, users: [user] });
    }
  }

  public isSavedCourt(court) {
    let index = this.courstSaved.findIndex(it => {
      return it.coordinates[0] === court.lng && it.coordinates[1] === court.lat;
    });
    if (index === -1) {
      return { saved: false, index };
    }

    return { saved: true, index };
  }

  public presentToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000
    });
    toast.present();
  }

}
