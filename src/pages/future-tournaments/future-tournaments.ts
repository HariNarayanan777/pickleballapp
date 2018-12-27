import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { AuthProvider } from '../../providers/auth/auth';


@IonicPage()
@Component({
  selector: 'page-future-tournaments',
  templateUrl: 'future-tournaments.html',
})
export class FutureTournamentsPage {

  public skip = 20;
  public tournaments = [];
  public idUser = "";

  constructor(
    public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient
  ) {
  }

  async ionViewDidLoad() {
    this.idUser = await AuthProvider.me.getIdUser();
    this.tournaments = await this.http.get("/tournaments?limit=20").toPromise() as any;
  }

  private async doInfinite(infiniteScroll) {
    try {
      let tournaments = await this.http.get(`/tournaments?limit=20&skip=${this.skip}`).toPromise() as any[];
      this.tournaments = this.tournaments.concat(tournaments);
      infiniteScroll.complete();
    }
    catch (e) {
      console.error(e);
    }
  }

  public saved(tournaments) {
    let idUser = this.idUser;
    return tournaments.savedTournaments.findIndex(it => {
      return it.user === idUser;
    }) !== -1;
  }

  public async addOrRemove(tour, save) {
    let idUser = this.idUser;
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

  public errorImage(e){
    e.target.src = "./assets/imgs/court-sport-default.jpg";
  }

}
