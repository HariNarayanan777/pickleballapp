import { Component, ViewChild, NgZone } from '@angular/core';
import { HomePage } from '../home/home';
import { CategoriesPage } from '../categories/categories';
import { SearchPage } from '../search/search';
import { AccountPage } from '../account/account';
import { MyApp } from '../../app/app.component';
import { ListChatPage } from '../list-chat/list-chat';
import { LiveComunicationProvider } from '../../providers/live-comunication/live-comunication';
import { Storage } from '@ionic/storage';
import { SearchPlacesPage } from '../search-places/search-places';
import { Tabs } from 'ionic-angular';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  @ViewChild('myTabs') tabRef: Tabs;

  // tab1Root = SearchPlacesPage;
  tab1Root = HomePage;
  tab2Root = CategoriesPage;
  tab3Root = ListChatPage;
  tab4Root = SearchPage;
  tab5Root = AccountPage;

  public static toTab = async (index: number) => { };
  constructor(
    public storage: Storage, public lc: LiveComunicationProvider,
    public zone: NgZone
  ) {
    MyApp.initNotifications();
    this.initSocketEvents();
    TabsPage.toTab = this.toTab.bind(this);
  }

  private async toTab(index: number) {
    await this.tabRef.select(index);
    this.zone.run(function () { console.log("change tab"); });
  }

  private async initSocketEvents() {
    await this.subscribeWebSocketsRoom();
    LiveComunicationProvider.eventsNotifications.onNoti = async function (notification) {
      let select = this.tabRef.getSelected();
      if (select === null || select.tabIcon !== "ios-notifications-outline") {
        let _div = document.getElementById("notification-rst");
        if (_div === null) {
          let div = document.createElement("div");
          div.setAttribute("id", "notification-rst");
          document.querySelector('[ng-reflect-name="ios-notifications-outline"]').parentElement.appendChild(div);
        }
      }
    }.bind(this);
  }

  private async subscribeWebSocketsRoom() {
    let userID: any = await this.storage.get("USER_ID");
    await this.lc.subscribeRoom(userID);
  }
}
