import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { ViewTournamentPage } from '../view-tournament/view-tournament';
import { AuthProvider } from '../../providers/auth/auth';


@IonicPage()
@Component({
  selector: 'page-saved-tournaments',
  templateUrl: 'saved-tournaments.html',
})
export class SavedTournamentsPage {

  public idUser = "";
  public tournaments = [];

  constructor(
    public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient
  ) {
  }

  async ionViewDidLoad() {
    this.idUser = await AuthProvider.me.getIdUser();
    this.tournaments = await this.http.get(`/savedtournaments?where={"user":"${this.idUser}"}&limit=100`).toPromise() as any;
    this.tournaments = this.tournaments.filter(it=>{
      return it.tournament !== null && it.tournament !== undefined;
    });
  }

  public toView(tournament) {
    this.navCtrl.push(ViewTournamentPage, { tournament });
  }

}
