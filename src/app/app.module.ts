import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { AboutPage } from '../pages/about/about';
import { ContactPage } from '../pages/contact/contact';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';

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
import { ComponentsModule } from '../components/components.module';
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
    SearchPlacesPageModule
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
    SearchPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Facebook,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    { provide: HTTP_INTERCEPTORS, useClass: InterceptorProvider, multi: true },
    RestProvider,
    Push,
    EmojiProvider,
    LiveComunicationProvider,
    Geolocation
  ]
})
export class AppModule {}
