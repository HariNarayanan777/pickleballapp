import { Component, NgZone } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { LoginPage } from '../pages/login/login';
import { Storage } from '@ionic/storage';
import { TabsPage } from '../pages/tabs/tabs';
import { Push, PushObject } from '@ionic-native/push';
import { HttpClient } from '@angular/common/http';
import { LiveComunicationProvider } from '../providers/live-comunication/live-comunication';
import { AuthProvider } from '../providers/auth/auth';
import { HelpersProvider } from '../providers/helpers/helpers';
import { FilterPage } from '../pages/filter/filter';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  rootPage: any;
  pushObject: PushObject;

  public static setNotifications = false;
  constructor(
    platform: Platform, statusBar: StatusBar,
    splashScreen: SplashScreen, public storage: Storage, public http: HttpClient,
    public lc: LiveComunicationProvider, public auht: AuthProvider,
    public helper: HelpersProvider, public zone: NgZone
  ) {
    platform.ready().then(() => {
      // splashScreen.hide();
      // statusBar.overlaysWebView(false);
      // statusBar.backgroundColorByHexString('#7dff2f');
      this.storage.get('LOGGED_IN').then((logged) => {
        if (logged == true) {
          // this.rootPage = FilterPage;
          this.rootPage = TabsPage;
        } else {
          this.rootPage = LoginPage;
        }
      });
      // this.helper.startBackgroundLocationSelf();
    });
  }

}
