import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';


@IonicPage()
@Component({
  selector: 'page-select-users',
  templateUrl: 'select-users.html',
})
export class SelectUsersPage {

  public users = [];
  public selectUsers = [];
  public searchTerm = "";
  public searchTerm1 = "";
  public selectType = "search";

  constructor(
    public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient, public viewCtrl: ViewController
  ) {
    if (this.navParams.get("users") !== undefined)
      this.selectUsers = this.navParams.get("users");
  }

  public async onSearchInput(type: number) {
    if (type == 1)
      this.users = await this.http.get(`/users/finds/abcd?name=${this.searchTerm}`).toPromise() as any[];
  }

  public add(user) {
    this.selectUsers.push(user);
  }

  public remove(user) {
    let index = this.selectUsers.findIndex(it => {
      return it.id === user.id;
    });
    if (index !== -1) {
      if (this.selectUsers.length === 1)
        this.selectUsers = [];
      else
        this.selectUsers.splice(index, 1);
    }
  }

  public isSave(user) {
    return this.selectUsers.findIndex(it => {
      return it.id === user.id;
    }) !== -1;
  }

  public isInSearch(user) {
    if (this.searchTerm1 === "") return true;
    return user.fullName.toLowerCase().includes(this.searchTerm1.toLowerCase());
  }

  public cancel() {
    this.users = [];
  }

  public finish() {
    this.viewCtrl.dismiss(this.selectUsers, "", { animation: "ios-transition" });
  }

}
