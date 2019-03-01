import { Component, NgZone, ViewChild } from '@angular/core';
import { Platform, Nav, App } from 'ionic-angular';

import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import { LiveComunicationProvider } from '../providers/live-comunication/live-comunication';
import { AuthProvider } from '../providers/auth/auth';
import { HelpersProvider } from '../providers/helpers/helpers';
import { ViewEventPage } from '../pages/view-event/view-event';
import { LoginPage } from '../pages/login/login';
import { AccountPage } from '../pages/account/account';
import { SearchPage } from '../pages/search/search';
import { MenuHorizontalProvider } from '../providers/menu-horizontal/menu-horizontal';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  rootPage: any;

  public pages = [
    { title: "Search", component: ViewEventPage, requiredLogin: false },
    { title: "Search Friends", component: SearchPage, requiredLogin: true },
    { title: "Profile", component: AccountPage, requiredLogin: true }
  ];

  public isLogged = false;
  public static changeLogin: Function;
  public static me: MyApp;

  constructor(
    platform: Platform, public storage: Storage,
    public http: HttpClient, public lc: LiveComunicationProvider,
    public auht: AuthProvider, public helper: HelpersProvider,
    public zone: NgZone, public app: App
  ) {

    platform.ready().then(() => {
      this.rootPage = ViewEventPage;
      this.storage.get('LOGGED_IN').then((logged) => {
        if (logged == true) {
          this.isLogged = true;
          MenuHorizontalProvider.isLogged = true;
        } else {
          this.isLogged = false;
          MenuHorizontalProvider.isLogged = false;
        }
      });
    });

    MyApp.changeLogin = function (isLogged: boolean) {
      this.isLogged = isLogged;
      MenuHorizontalProvider.isLogged = isLogged;
      this.zone.run(function () { console.log("change Login"); });
    }.bind(this);
    MyApp.me = this;
  }

  public static goPage(id) {
    switch (id) {
      case 's':
        MyApp.me.app.getActiveNavs()[0].setRoot(ViewEventPage);
        break;
      case 'sf':
        MyApp.me.app.getActiveNavs()[0].setRoot(SearchPage);
        break;
      case 'p':
        MyApp.me.app.getActiveNavs()[0].setRoot(AccountPage);
        break;
      case 'l':
        MyApp.me.app.getActiveNavs()[0].setRoot(LoginPage);
        break;
    }
    MyApp.me.zone.run(function () { console.log("change Login"); });
  }

}
