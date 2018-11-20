import { Component } from '@angular/core';
import { HomePage } from '../home/home';
import { CategoriesPage } from '../categories/categories';
import { MapPage } from '../map/map';
import { SearchPage } from '../search/search';
import { AccountPage } from '../account/account';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = HomePage;
  tab2Root = CategoriesPage;
  tab3Root = MapPage;
  tab4Root = SearchPage;
  tab5Root = AccountPage;

  constructor() {

  }
}
