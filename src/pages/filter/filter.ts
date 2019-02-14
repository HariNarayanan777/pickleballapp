import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { LiveComunicationProvider } from '../../providers/live-comunication/live-comunication';

declare var google: any;

@IonicPage()
@Component({
  selector: 'page-filter',
  templateUrl: 'filter.html',
})
export class FilterPage {

  public courts = false;
  public rvresourts = false;
  public tournaments = false;
  public dateStart = new Date();
  public dateEnd = new Date();
  public address = "";
  public maxDistance = 30;
  public type = "court";

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public viewCtrl: ViewController
  ) {
    this.type = this.navParams.get("type");
    this.dateStart = this.navParams.get("dateStart");
    this.dateEnd = this.navParams.get("dateEnd");
    this.address = this.navParams.get("address");
    this.maxDistance = parseInt(this.navParams.get("maxDistance"));
  }

  async ionViewDidLoad() {
    await LiveComunicationProvider.reloadGoogleplaces();
    let input = () => { return document.querySelector("#input-location-address input") };
    new google.maps.places.Autocomplete(input());
  }

  ngAfterViewInit() {
    console.log(this.navParams.get("myCurrentLocation"));
    if (this.navParams.get("myCurrentLocation") === true)
      this.radioButton(true);
  }

  public async chageDate(date) {
    let newDate = await HelpersProvider.me.nativeDatePicker({
      defaultDate: this[date]
    });
    if (newDate) {
      this[date] = newDate;
    }
  }

  public onChange() {
    if (this.address === "")
      this.radioButton(true);
    else
      this.radioButton(false);
  }

  public radioButton(checked: boolean) {
    let cs = "radio-checked";
    let classList = document.querySelector("#search-from .radio-icon").classList;
    if (checked === true) {
      this.address = "";
      console.log(this.address);
      classList.add(cs);
    }
    if (checked === false) classList.remove(cs);
  }

  public finish() {
    let address = (document.querySelector("#input-location-address input") as any).value;
    if (this.type === "court") {
      let p = {
        maxDistance: this.maxDistance,
        myCurrentLocation: address === '',
        address
      };
      this.viewCtrl.dismiss(p);
    } else {
      let p = {
        maxDistance: this.maxDistance,
        myCurrentLocation: address === '',
        address,
        dateStart: this.dateStart,
        dateEnd: this.dateEnd
      };
      this.viewCtrl.dismiss(p);
    }
  }

}
