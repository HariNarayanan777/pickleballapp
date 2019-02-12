import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import * as moment from 'moment';
import { AuthProvider } from '../../providers/auth/auth';
import { HttpClient } from '@angular/common/http';
import { InterceptorProvider } from '../../providers/interceptor/interceptor';

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
  public isEvent = false;

  constructor(
    public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient
  ) {
    if (this.navParams.get("save") !== undefined) {
      this.save = true;
    }
    if (this.navParams.get("isEvent") === true) {
      this.isEvent = true;
    }
  }

  async ionViewDidLoad() {
    this.userID = await AuthProvider.me.getIdUser();
    let tournament = this.navParams.get("tournament");
    console.log(tournament);
    if (tournament.type === "event")
      this.tournament = tournament;
    else
      this.tournament = await this.http.get("/tournaments/" + tournament.id).toPromise() as any;

    if (!this.tournament.coordinates) return;

    let lat = this.tournament.coordinates[1];
    let lng = this.tournament.coordinates[0];
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
    if (tour.type === "event")
      await this.addOrRemoveEvent(tour);
    else
      await this.addOrRemoveTournament(tour, save);
  }

  private async addOrRemoveEvent(tour) {
    let idUser = this.userID;
    if (tour.isSave === true) {
      await this.http.delete('/eventuser/' + tour.savedId).toPromise();
      this.tournament.isSave = false;
    } else {
      let eventsaved = await this.http.post('/eventuser', { user: idUser, event: tour.id }).toPromise() as any;
      this.tournament.isSave = true;
      this.tournament.savedId = eventsaved.id;
    }
  }

  private async addOrRemoveTournament(tour, save) {
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

  public saved() {
    let idUser = this.userID;
    if (this.tournament.type === "event") {
      return this.tournament.isSave;
    } else {
      return this.tournament.savedTournaments.findIndex(it => {
        return it.user === idUser;
      }) !== -1;
    }
  }

  public getUrl(url) {
    return url.includes("/" + this.tournament.id) === true ? InterceptorProvider.tranformUrl(url) : url;
  }
}
