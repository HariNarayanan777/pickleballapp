import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { AboutPage } from '../pages/about/about';
import { ContactPage } from '../pages/contact/contact';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';

import { BackgroundGeolocation } from '@ionic-native/background-geolocation';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { CategoriesPageModule } from '../pages/categories/categories.module';
import { MapPageModule } from '../pages/map/map.module';
import { SearchPageModule } from '../pages/search/search.module';
import { AccountPageModule } from '../pages/account/account.module';
import { LoginPageModule } from '../pages/login/login.module';
import { Facebook } from '@ionic-native/facebook';
import { IonicStorageModule } from '@ionic/storage';
import { InterceptorProvider } from '../providers/interceptor/interceptor';
import { RestProvider } from '../providers/rest/rest';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { UpdateAccountPageModule } from '../pages/update-account/update-account.module';
import { Push } from '@ionic-native/push';
import { ChatPageModule } from '../pages/chat/chat.module';
import { ChatPage } from '../pages/chat/chat';
import { EmojiProvider } from '../providers/emoji/emoji';
import { ListChatPageModule } from '../pages/list-chat/list-chat.module';
import { ListChatPage } from '../pages/list-chat/list-chat';
import { LiveComunicationProvider } from '../providers/live-comunication/live-comunication';
import { SearchPlacesPageModule } from '../pages/search-places/search-places.module';
import { SearchPage } from '../pages/search/search';
import { Geolocation } from '@ionic-native/geolocation';
import { CreateAccountPageModule } from '../pages/create-account/create-account.module';
import { CreateAccountPage } from '../pages/create-account/create-account';
import { AuthProvider } from '../providers/auth/auth';
import { FutureTournamentsPageModule } from '../pages/future-tournaments/future-tournaments.module';
import { FutureTournamentsPage } from '../pages/future-tournaments/future-tournaments';
import { SavedTournamentsPageModule } from '../pages/saved-tournaments/saved-tournaments.module';
import { ViewTournamentPageModule } from '../pages/view-tournament/view-tournament.module';
import { SavedTournamentsPage } from '../pages/saved-tournaments/saved-tournaments';
import { ViewTournamentPage } from '../pages/view-tournament/view-tournament';
import { ShareAppPageModule } from '../pages/share-app/share-app.module';
import { ShareAppPage } from '../pages/share-app/share-app';
import { Diagnostic } from '@ionic-native/diagnostic';
import { CourtsSavedPageModule } from '../pages/courts-saved/courts-saved.module';
import { CourtsSavedPage } from '../pages/courts-saved/courts-saved';
import { HelpersProvider } from '../providers/helpers/helpers';
import { NearCourtsAndTournamentsPageModule } from '../pages/near-courts-and-tournaments/near-courts-and-tournaments.module';
import { NearCourtsAndTournamentsPage } from '../pages/near-courts-and-tournaments/near-courts-and-tournaments';
import { ListFriendPageModule } from '../pages/list-friend/list-friend.module';
import { ListFriendPage } from '../pages/list-friend/list-friend';
import { ViewCourtPage } from '../pages/view-court/view-court';
import { ViewCourtPageModule } from '../pages/view-court/view-court.module';

@NgModule({
  declarations: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    CategoriesPageModule,
    MapPageModule,
    SearchPageModule,
    AccountPageModule,
    LoginPageModule,
    HttpClientModule,
    UpdateAccountPageModule,
    ChatPageModule,
    ListChatPageModule,
    SearchPlacesPageModule,
    CreateAccountPageModule,
    FutureTournamentsPageModule,
    SavedTournamentsPageModule,
    ViewTournamentPageModule,
    ShareAppPageModule,
    CourtsSavedPageModule,
    NearCourtsAndTournamentsPageModule,
    ListFriendPageModule,
    ViewCourtPageModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,
    ChatPage,
    ListChatPage,
    SearchPage,
    CreateAccountPage,
    FutureTournamentsPage,
    SavedTournamentsPage,
    ViewTournamentPage,
    ShareAppPage,
    CourtsSavedPage,
    NearCourtsAndTournamentsPage,
    ListFriendPage,
    ViewCourtPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Facebook,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    { provide: HTTP_INTERCEPTORS, useClass: InterceptorProvider, multi: true },
    RestProvider,
    Push,
    Diagnostic,
    EmojiProvider,
    LiveComunicationProvider,
    Geolocation,
    AuthProvider,
    BackgroundGeolocation,
    HelpersProvider
  ]
})
export class AppModule {}
