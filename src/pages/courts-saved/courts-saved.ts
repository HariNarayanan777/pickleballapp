import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { HttpClient } from '@angular/common/http';
import { ViewCourtPage } from '../view-court/view-court';
import { LiveComunicationProvider } from '../../providers/live-comunication/live-comunication';

declare var google: any;

@IonicPage()
@Component({
  selector: 'page-courts-saved',
  templateUrl: 'courts-saved.html',
})
export class CourtsSavedPage {

  public courts = [];
  public map:any = {};

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient
  ) {
  }

  async ionViewDidLoad() {
    await LiveComunicationProvider.reloadGoogleplaces();

    let mapOptions: any = {
      center: {
        lat: 36.778259,
        lng: -119.417931
      },
      zoom: 12
    };
    this.map = new google.maps.Map(document.getElementById("map_tls"), mapOptions);

    let user = await AuthProvider.me.getIdUser(),
      query = { user };
    this.courts = await this.http.get(`/court?where=${JSON.stringify(query)}`).toPromise() as any[];
    console.log(this.courts);
  }

  public getImage(court) {
    if (court.photos) {
      return court.photos[0]
    } else {
      return "./assets/imgs/court-sport-default.jpg";
    }
  }

  public loadImage(court) {
    court.loadImage = true;
  }

  public errorImage(e) {
    e.target.src = "./assets/imgs/court-sport-default.jpg";
  }

  public toCourtDetails(court) {
    CourtsSavedPage.toCourtDetails(this, court)
  }

  public static async toCourtDetails(context, court) {
    let getPlaceId = function (latitude, longitude) {
      var geocoder = new google.maps.Geocoder;

      var latlng = { lat: parseFloat(latitude), lng: parseFloat(longitude) };

      return new Promise((resolve, reject) => {
        geocoder.geocode({ 'location': latlng }, function (results, status) {
          if (status === google.maps.GeocoderStatus.OK) {
            if (results[1]) {
              console.log(results[1].place_id);
              resolve(results[1].place_id);
            } else {
              resolve("");
            }
          } else {
            resolve("");
          }
        });
      });
    };
    let fields = ['photos', 'formatted_address', 'name', 'rating', 'opening_hours', 'geometry', 'price_level', 'website', 'international_phone_number', 'formatted_phone_number']
    let service = new google.maps.places.PlacesService(context.map);
    var request = {
      placeId: court.place_id || await getPlaceId(court.coordinates[1], court.coordinates[0]),
      fields
    };
    service.getDetails(request, place => {
      console.log(place);
      court.photos = place.photos ? place.photos.map(it => it.getUrl({ 'maxWidth': 600, 'maxHeight': 200 })) : court.photos;
      court.website = place.website || undefined;
      court.formatted_phone_number = place.formatted_phone_number || undefined;
      court.opening_hours = place.opening_hours || undefined;
      context.navCtrl.push(ViewCourtPage, { court });
    });
  }


}
