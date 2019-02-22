import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { App } from 'ionic-angular';
import { Storage } from '@ionic/storage';

@Injectable()
export class AuthProvider {

  public static me: AuthProvider;
  public USER_TOKEN = "";

  constructor(public http: HttpClient, public app: App, private storage: Storage) {
    this.storage.get("USER_TOKEN").then(token => {
      if (token)
        this.USER_TOKEN = token;
    });
    AuthProvider.me = this;
  }

  public getToken() {
    if (this.USER_TOKEN !== "") {
      return this.USER_TOKEN;
    }
    return null;
  }

  public async saveLoginUser(user, withEmailAndPassword?) {
    withEmailAndPassword = withEmailAndPassword || false;
    await this.storage.set('USER_ID', user['id']);
    console.log(user.token);
    if (user.token !== undefined && user.token !== null) {
      await this.storage.set('USER_TOKEN', user['token']);
      this.USER_TOKEN = user.token
    }
    await this.storage.set('LOGGED_IN', true);
    if (withEmailAndPassword === true) {
      await this.storage.set('SESIONEMAIL', true);
    }
  }

  public async getIdUser(): Promise<string> {
    let id = await this.storage.get('USER_ID') as string;
    if (id) return id;
    return "";
  }

}
