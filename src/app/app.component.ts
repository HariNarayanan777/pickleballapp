import { Component, NgZone, ViewChild } from '@angular/core';
import { Platform, Nav } from 'ionic-angular';

import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import { LiveComunicationProvider } from '../providers/live-comunication/live-comunication';
import { AuthProvider } from '../providers/auth/auth';
import { HelpersProvider } from '../providers/helpers/helpers';
import { ViewEventPage } from '../pages/view-event/view-event';
import { LoginPage } from '../pages/login/login';
import { AccountPage } from '../pages/account/account';
import { SearchPage } from '../pages/search/search';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  @ViewChild(Nav) nav: Nav;
  rootPage: any;

  public pages = [
    { title: "Search", component: ViewEventPage },
    { title: "Search Friends", component: SearchPage },
    { title: "Profile", component: AccountPage }
  ];
  constructor(
    platform: Platform, public storage: Storage,
    public http: HttpClient, public lc: LiveComunicationProvider,
    public auht: AuthProvider, public helper: HelpersProvider,
    public zone: NgZone
  ) {
    platform.ready().then(() => {
      this.storage.get('LOGGED_IN').then((logged) => {
        if (logged == true) {
          // this.rootPage = FilterPage;
          this.rootPage = ViewEventPage;
        } else {
          this.rootPage = LoginPage;
        }
      });
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }

}
