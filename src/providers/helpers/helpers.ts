import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BackgroundGeolocation, BackgroundGeolocationConfig, BackgroundGeolocationResponse } from '@ionic-native/background-geolocation';
import { InterceptorProvider } from '../interceptor/interceptor';
import { Platform } from 'ionic-angular';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { Diagnostic } from '@ionic-native/diagnostic';
import { AuthProvider } from '../auth/auth';

@Injectable()
export class HelpersProvider {

  public static me: HelpersProvider;

  constructor(
    public http: HttpClient, public backgroundGeolocation: BackgroundGeolocation,
    public platform: Platform, public geolocation: Geolocation,
    public diagnostic: Diagnostic
  ) {
    HelpersProvider.me = this;
  }

  public async startBackgroundLocationSelf() {
    const config: BackgroundGeolocationConfig = {
      desiredAccuracy: 10,
      stationaryRadius: 20,
      distanceFilter: 30,
      debug: true,
      stopOnTerminate: false,
      url: InterceptorProvider.tranformUrl("/user-location-background"),
      syncUrl: InterceptorProvider.tranformUrl("/user-locaion-background-fail"),
      httpHeaders: {
        "user": await AuthProvider.me.getIdUser()
      }
    };
    this.backgroundGeolocation.configure(config)
      .subscribe((location: BackgroundGeolocationResponse) => {

        console.log(location);
        this.backgroundGeolocation.finish();
        this.backgroundGeolocation.stop();
      });

    // start recording location
    this.backgroundGeolocation.start();

  }

  public async startBackgroundLocation() {
    const config: BackgroundGeolocationConfig = {
      desiredAccuracy: 10,
      stationaryRadius: 20,
      distanceFilter: 30,
      debug: true,
      stopOnTerminate: false,
      url: InterceptorProvider.tranformUrl("/user-location-background"),
      httpHeaders: {
        "user": await AuthProvider.me.getIdUser()
      }
    };
    console.log(config);
    this.backgroundGeolocation.configure(config)
      .subscribe((location: BackgroundGeolocationResponse) => {

        console.log(location);

      });

    // start recording location
    this.backgroundGeolocation.start();

  }


  public async stopBackgroundLocation() {
    await this.backgroundGeolocation.stop();
  }

  public async getMyPosition(): Promise<Geoposition> {
    let position: any;
    let options = {
      timeout: 20000 //sorry I use this much milliseconds
    }
    if (this.platform.is("cordova") === true) {
      if (await this.diagnostic.isLocationAuthorized() === false) {
        await this.diagnostic.requestLocationAuthorization();
        if (await this.diagnostic.isLocationAuthorized() === true) {
          position = await this.geolocation.getCurrentPosition(options);
        }
      } else {
        position = await this.geolocation.getCurrentPosition(options);
      }
    } else {
      position = await this.geolocation.getCurrentPosition(options);
    }

    return position;
  }
}
