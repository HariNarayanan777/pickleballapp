import { Component } from '@angular/core';
import { HomePage } from '../home/home';
import { CategoriesPage } from '../categories/categories';
import { SearchPage } from '../search/search';
import { AccountPage } from '../account/account';
import { MyApp } from '../../app/app.component';
import { ListChatPage } from '../list-chat/list-chat';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = HomePage;
  tab2Root = CategoriesPage;
  tab3Root = ListChatPage;
  tab4Root = SearchPage;
  tab5Root = AccountPage;

  constructor() {
    MyApp.initNotifications();
  }
}
