import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import * as moment from 'moment';
import { AuthProvider } from '../../providers/auth/auth';
import { HttpClient } from '@angular/common/http';

declare var google;
@IonicPage()
@Component({
  selector: 'page-view-tournament',
  templateUrl: 'view-tournament.html',
})
export class ViewTournamentPage {

  public tournament: any = { savedTournaments: [], coordinates: [] };
  private map: any;
  public save = false;
  public userID = "";
  public tournaments = [];

  constructor(
    public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient
  ) {
    if (this.navParams.get("save") !== undefined) {
      this.save = true;
    }
  }

  async ionViewDidLoad() {
    this.userID = await AuthProvider.me.getIdUser();
    let tournament = this.navParams.get("tournament");
    console.log(tournament);
    this.tournament = await this.http.get("/tournaments/" + tournament.id).toPromise() as any;
    if (!this.tournament.latLng) return;

    let lat = this.tournament.latLng.lat;
    let lng = this.tournament.latLng.lng;
    let mapOptions: any = {
      center: {
        lat,
        lng
      },
      zoom: 12
    };

    this.map = new google.maps.Map(document.getElementById("map_tournament"), mapOptions);

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
        lat,
        lng
      },
      map: this.map,
      icon: image
    });

  }

  public dateToFormat(date) {
    return moment(date).format("ddd DD/MM/YYYY");
  }

  public async addOrRemove(tour, save) {
    let idUser = this.userID;
    if (save === true) {
      let index = tour.savedTournaments.findIndex(it => {
        return it.user === idUser;
      });
      await this.http.delete('/savedtournaments/' + tour.savedTournaments[index].id).toPromise();
      if (tour.savedTournaments.length === 1)
        tour.savedTournaments = [];
      else
        tour.savedTournaments.splice(index, 1);

    } else {
      let index = tour.savedTournaments.findIndex(it => {
        return it.user === idUser;
      });
      await this.http.post('/savedtournaments', { user: idUser, tournament: tour.id }).toPromise();
      tour.savedTournaments.push({ user: idUser, tournament: tour.id });
    }
  }

  public saved(tournaments) {
    let idUser = this.userID;
    return tournaments.savedTournaments.findIndex(it => {
      return it.user === idUser;
    }) !== -1;
  }
}
