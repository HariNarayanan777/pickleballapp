import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { HttpClient } from '@angular/common/http';


@IonicPage()
@Component({
  selector: 'page-near-courts-and-tournaments',
  templateUrl: 'near-courts-and-tournaments.html',
})
export class NearCourtsAndTournamentsPage {

  public resultsCourts = [];
  public resultsTournaments = [];
  public userID = "";

  constructor(
    public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient
  ) {
    this.resultsCourts = this.navParams.get("resultsCourts");
    this.resultsTournaments = this.navParams.get("resultsTournaments");
  }

  async ionViewDidLoad() {
    this.userID = await AuthProvider.me.getIdUser();
  }

  public async addOrRemove(tour, save) {
    let idUser = this.userID;
    if (save === true) {
      await this.http.delete('/savedtournaments/' + tour.savedId).toPromise();
      tour.isSave = false;
    } else {
      let save:any = await this.http.post('/savedtournaments', { user: idUser, tournament: tour.id }).toPromise();
      tour.isSave = true;
      tour.savedId = save.id;
    }
  }

}
