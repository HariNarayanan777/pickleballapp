import { Component, NgZone } from '@angular/core';
import { Platform } from 'ionic-angular';

import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import { LiveComunicationProvider } from '../providers/live-comunication/live-comunication';
import { AuthProvider } from '../providers/auth/auth';
import { HelpersProvider } from '../providers/helpers/helpers';
import { ViewEventPage } from '../pages/view-event/view-event';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  rootPage: any;

  public static setNotifications = false;
  constructor(
    platform: Platform, public storage: Storage,
    public http: HttpClient, public lc: LiveComunicationProvider,
    public auht: AuthProvider, public helper: HelpersProvider,
    public zone: NgZone
  ) {
    platform.ready().then(() => {
      this.rootPage = ViewEventPage;
    });
  }

}
