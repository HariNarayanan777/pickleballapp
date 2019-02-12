import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { ViewTournamentPage } from '../view-tournament/view-tournament';
import { AuthProvider } from '../../providers/auth/auth';
import { InterceptorProvider } from '../../providers/interceptor/interceptor';


@IonicPage()
@Component({
  selector: 'page-saved-tournaments',
  templateUrl: 'saved-tournaments.html',
})
export class SavedTournamentsPage {

  public idUser = "";
  public tournaments = [];
  public isEvents = false;

  constructor(
    public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient
  ) {
    if (this.navParams.get("isEvents") !== undefined) {
      this.isEvents = true;
    }
  }

  async ionViewDidLoad() {
    this.idUser = await AuthProvider.me.getIdUser();
    if (this.isEvents === false) {
      this.tournaments = await this.http.get(`/savedtournaments?where={"user":"${this.idUser}"}&limit=100&sort=createdAt DESC`).toPromise() as any;
      this.tournaments = this.tournaments.filter(it => {
        return it.tournament !== null && it.tournament !== undefined;
      });
    } else {
      let query = { user: this.idUser };
      let tournaments = await this.http.get(`/event?where=${JSON.stringify(query)}&limit=100&sort=createdAt DESC`).toPromise() as any;
      // tournaments = tournaments.filter(it => {
      //   return it.event !== null && it.event !== undefined;
      // });
      this.tournaments = tournaments.map(it => {
        return {
          tournament: {
            title: it.name,
            address: it.locationText,
            imgs: it.images !== null && it.images.length > 0 ? it.images : ['assets/imgs/court-sport-default.jpg'],
            id: it.id,
            coordinates: it.locationCoords,
            type: "event",
            dates: it.matchTimes,
            registrationStart: it.date,
            endRegistration: it.date,
            note: it.travelInfo
          }
        };
      });

    }
  }

  public errorImage(e){
    e.target.src = "assets/imgs/court-sport-default.jpg";
  }

  public transformUrl(url) {
    return InterceptorProvider.tranformUrl(url);
  }

  public toView(tournament) {
    this.navCtrl.push(ViewTournamentPage, { tournament, isEvent: this.isEvents });
  }

}
