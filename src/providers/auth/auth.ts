import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { App } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { TabsPage } from '../../pages/tabs/tabs';

@Injectable()
export class AuthProvider {

  public static me: AuthProvider;

  constructor(public http: HttpClient, public app: App, private storage: Storage) {
    AuthProvider.me = this;
  }

  public async saveLoginUser(user, withEmailAndPassword?) {
    withEmailAndPassword = withEmailAndPassword || false;
    await this.storage.set('USER_ID', user['id']);
    if (user.token) {
      await this.storage.set('USER_TOKEN', user['token']);
    }
    await this.storage.set('LOGGED_IN', true);
    if(withEmailAndPassword===true){
      await this.storage.set('SESIONEMAIL', true);
    }
    this.app.getRootNavs()[0].setRoot(TabsPage);
  }

  public async getIdUser(): Promise<string> {
    let id = await this.storage.get('USER_ID') as string;
    if (id) return id;
    return "";
  }

}
