import { Component, ViewChild, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, ViewController, Slides } from 'ionic-angular';
import * as moment from "moment";
import { AuthProvider } from '../../providers/auth/auth';
import { HttpClient } from '@angular/common/http';
import { LiveComunicationProvider } from '../../providers/live-comunication/live-comunication';
import { LaunchNavigator, LaunchNavigatorOptions } from '@ionic-native/launch-navigator';
declare var google;

@IonicPage()
@Component({
  selector: 'page-view-court',
  templateUrl: 'view-court.html',
})
export class ViewCourtPage {

  @ViewChild("mySlide") slides: Slides;

  public court: any = {};
  public map: any = {};
  public courstSaved = [];
  public orderXSkill: { skill: number, users: any[] }[] = [];
  private idUser = "";
  public _viewMap = false;

  constructor(
    public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient, public toastCtrl: ToastController,
    public viewCtrl: ViewController, public zone: NgZone,
    private launchnavigator: LaunchNavigator
  ) {
    let court = this.navParams.get("court");
    if (!court.users)
      court.users = [];
    this.court = court;
    this.court.updated = new Date(this.court.updated);
    console.log(this.court);
  }

  public nextSlide() {
    this.slides.slideNext();
  }

  public backSlide() {
    this.slides.slidePrev();
  }

  async ionViewDidLoad() {
    this.idUser = await AuthProvider.me.getIdUser();
    await this.getCourtUsers();
    await LiveComunicationProvider.reloadGoogleplaces();
    this.court.lat = this.court.lat || this.court.coordinates[1];
    this.court.lng = this.court.lng || this.court.coordinates[0];
    let center = {
      lat: this.court.lat,
      lng: this.court.lng
    };
    console.log(center);
    let mapOptions: any = {
      center,
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
      position: center,
      map: this.map,
      icon: image
    });

  }

  public async getCourtUsers() {
    if (this.court.id !== undefined && this.court.id !== null) {
      let court = await this.http.get(`/court-find?where=${JSON.stringify({ id: this.court.id })}`).toPromise() as any;
      if (court[0]) this.court.users = court[0].users;
      else this.court.users = [];
    }
    else this.court.users = [];

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

  public viewMap() {
    this._viewMap = !this._viewMap;
    this.zone.run(function () {
      console.log("change vista");
    })
  }

  public dateToFormat(date) {
    return moment(date).format("ddd DD/MM/YYYY");
  }

  public saveOrRemove() {
    if (this.isSavedCourt() === true) {
      this.removeCourt();
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
        let _court = await this.http.post("/court", ite).toPromise() as any;
        this.court.id = _court.id;
        this.presentToast("Saved Court");
        await this.getCourtUsers();
        this.zone.run(function () { console.log("action court"); });
      }
      catch (e) {
        console.error(e);
      }
    }
  }

  public async removeCourt() {
    let pos = await this.isSavedCourt();
    if (pos === true && this.court.id !== undefined && this.court.id !== null) {
      await this.http.delete(`/court/${this.court.id}`).toPromise();
      delete this.court.id;
      this.presentToast("Court Removed");
      await this.getCourtUsers();
      console.log("remove court");
      this.zone.run(function () { console.log("action court"); });
    }
  }


  public isSavedCourt() {
    let index = this.court.users.findIndex(it => {
      return it.id === this.idUser;
    });
    return index !== -1;
  }

  public getDay(open) {
    let d = moment().local();
    d.day(open.day);
    return d.format("dddd");
  }

  public getPeriod(p) {
    return `${moment(p.open.hours + "-" + p.open.minutes, "HH-mm").format("hh:mma")} - ${moment(p.close.hours + "-" + p.close.minutes, "HH-mm").format("hh:mma")}`
  }

  public presentToast(message) {
    // let toast = this.toastCtrl.create({
    //   message: message,
    //   duration: 3000
    // });
    // toast.present();
  }

  public launchNavigator() {
    let isAvailable = this.launchnavigator.isAppAvailable(this.launchnavigator.APP.GOOGLE_MAPS);
    let options: LaunchNavigatorOptions;
    if (isAvailable) {
      options = {
        // start: 'London, ON',
        app: this.launchnavigator.APP.GOOGLE_MAPS
      }
    } else {
      console.warn("Google Maps not available - falling back to user selection");
      options = {
        // start: 'London, ON',
        app: this.launchnavigator.APP.USER_SELECT
      }
    }
    this.launchnavigator.navigate([this.court.coordinates[1], this.court.coordinates[1]], options);
  }

}
