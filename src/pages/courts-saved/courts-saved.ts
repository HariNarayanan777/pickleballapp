import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { HttpClient } from '@angular/common/http';


@IonicPage()
@Component({
  selector: 'page-courts-saved',
  templateUrl: 'courts-saved.html',
})
export class CourtsSavedPage {

  public courts = [];

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient
  ) {
  }

  async ionViewDidLoad() {
    let user = await AuthProvider.me.getIdUser(),
      query = { user };
    this.courts = await this.http.get(`/court?where=${JSON.stringify(query)}`).toPromise() as any[];
    console.log(this.courts);
  }

  public getImage(court){
    if(court.photos){
      return court.photos[0]
    }else{
      return "./assets/imgs/court-sport-default.jpg";
    }
  }

  public loadImage(court) {
    court.loadImage = true;
  }

  public errorImage(e) {
    e.target.src = "./assets/imgs/court-sport-default.jpg";
  }
}
