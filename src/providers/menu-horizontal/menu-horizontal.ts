import { Injectable } from '@angular/core';
import { App } from 'ionic-angular';
import { MyApp } from '../../app/app.component';

@Injectable()
export class MenuHorizontalProvider {

  public static isLogged = false;
  public static current = "s";
  constructor(public app: App) {
  }

  public goPage(id) {
    console.log(id);
    MyApp.goPage(id);
    MenuHorizontalProvider.current = id;
  }

  public selectPage(id) {
    return MenuHorizontalProvider.current === id;
  }

  public validLogin(requiredLogin, noMastrarInlogged?) {
    if (requiredLogin === true) return !MenuHorizontalProvider.isLogged === true;
    if (noMastrarInlogged === true) {
      if (MenuHorizontalProvider.isLogged === true) return true;
      return false;
    }
    return false;
  }

}
