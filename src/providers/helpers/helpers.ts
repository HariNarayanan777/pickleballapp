import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BackgroundGeolocation, BackgroundGeolocationConfig, BackgroundGeolocationResponse } from '@ionic-native/background-geolocation';
import { InterceptorProvider } from '../interceptor/interceptor';
import { Platform, ModalController, ToastController, AlertController, App } from 'ionic-angular';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { Diagnostic } from '@ionic-native/diagnostic';
import { AuthProvider } from '../auth/auth';
import { CalendarModal, CalendarResult, CalendarModalOptions } from 'ion2-calendar';
import { AmazingTimePickerService } from 'amazing-time-picker';
import * as moment from 'moment';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { ImageViewPage } from '../../pages/image-view/image-view';
import { CameraPage } from '../../pages/camera/camera';
import { LocationAccuracy } from '@ionic-native/location-accuracy';

@Injectable()
export class HelpersProvider {

  public static me: HelpersProvider;

  constructor(
    public http: HttpClient, public backgroundGeolocation: BackgroundGeolocation,
    public platform: Platform, public geolocation: Geolocation,
    public diagnostic: Diagnostic, public modalCtrl: ModalController,
    public atps: AmazingTimePickerService, public toastCtrl: ToastController,
    public alertCtrl: AlertController, public camera: Camera, public app: App,
    public locationAccuracy: LocationAccuracy
  ) {
    HelpersProvider.me = this;
  }

  public async startBackgroundLocationSelf() {
    const config: BackgroundGeolocationConfig = {
      desiredAccuracy: 10,
      stationaryRadius: 20,
      distanceFilter: 30,
      debug: false,
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
      debug: false,
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
        this.backgroundGeolocation.finish();
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
    };
    try {
      if (this.platform.is("cordova") === true) {
        //Para comprobar si tiene los permisos
        if (await this.diagnostic.isLocationAuthorized() === false) {
          await this.diagnostic.requestLocationAuthorization();
          if (await this.diagnostic.isLocationAuthorized() === false) {
            await this.diagnostic.requestLocationAuthorization();
          }
        }
        //Para comprobar si tiene habilitado el gps
        if (await this.diagnostic.isGpsLocationAvailable() === false ||
          await this.diagnostic.isGpsLocationEnabled() === false
        ) {
          this.locationAccuracy.canRequest().then((canRequest: boolean) => {

            if (canRequest) {
              // the accuracy option will be ignored by iOS
              this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
                () => console.log('Request successful'),
                error => console.log('Error requesting location permissions', error)
              );
            }

          });
          return null;
        }
        position = await this.geolocation.getCurrentPosition(options);
        return position;
      }
      return await this.geolocation.getCurrentPosition(options);
    }
    catch (e) {
      console.error(e);
    }
    return null;
  }

  public nativeDatePicker(options?: CalendarModalOptions): Promise<Date> {
    options = options || {};

    let myCalendar = this.modalCtrl.create(CalendarModal, {
      options: options
    });

    myCalendar.present();

    return new Promise(function (resolve, reject) {

      myCalendar.onDidDismiss((date: CalendarResult, type: string) => {
        if (date === null) {
          return resolve(null);
        }
        resolve(date.dateObj);
      })

    })
  }

  public nativeTimePicker(): Promise<Date> {
    let amazingTimePicker = this.atps.open();

    return new Promise(function (resolve, reject) {
      amazingTimePicker.afterClose().subscribe(time => {
        let date = moment(time, "HH:mm").toDate();
        resolve(date);
      });
    })

  }

  public presentToast(message) {
    return this.toastCtrl.create({ message, duration: 3000 })
      .present();
  }

  private pickFileBrowserDataUrl(resolve, reject) {

    try {

      let pick = document.createElement("input");
      pick.setAttribute("type", "file");

      document.body.appendChild(pick);

      let handleFile = function (e: any) {

        var files = e.target.files, f = files[0];
        console.log(files);
        var reader = new FileReader();

        reader.onload = function (e) {

          let target: any = e.target;
          let data = target.result;
          resolve(data);
          document.body.removeChild(pick);
        };

        reader.readAsDataURL(f);
      }

      pick.addEventListener('change', handleFile, false);

      pick.click();
    }
    catch (e) {
      reject(e);
    }

  }

  public Camera(parameters: { width?, height?, quality?, resolve?, reject?}, resize?: boolean): Promise<File> {
    var t = this;
    let params: any = {};
    params.width = parameters.width || 300;
    params.height = parameters.height || 300;
    params.quality = 100;
    params.resize = resize || null;

    return new Promise(async function (resolve, reject) {

      params.resolve = resolve;
      params.reject = reject;

      if (t.platform.is("cordova") === false) {
        return t.pickFileBrowserDataUrl(async function (dataUrl) {
          params.image = dataUrl;
          params.navigator = true;
          // let blob = t.b64toBlob(dataUrl, "image/jpeg");
          // let file = t.blobToFile(blob, "image");
          // resolve(file);
          await t.app.getActiveNavs()[0].push(ImageViewPage, params);
        }, reject);
      }

      // await t.getPhotoNative(params);
      t.diagnostic.isCameraAuthorized().then(async (authorized) => {
        console.log(authorized);
        if (authorized) {
          // await t.getPhotoNative(params);
          await t.app.getActiveNavs()[0].push(CameraPage, params);
        } else {
          t.diagnostic.requestCameraAuthorization(true).then(async (status) => {
            console.log(status, t.diagnostic.permissionStatus.GRANTED);
            if (status == t.diagnostic.permissionStatus.GRANTED) {
              // await t.getPhotoNative(params);
              await t.app.getActiveNavs()[0].push(CameraPage, params);
            } else {
              console.log("not permiss");
              reject({ message: "permiss denied" });
            }
          });
        }
      })
    });
  }

  public getPhotoNative(params) {
    try {
      let options: CameraOptions = {
        quality: 100,
        destinationType: this.camera.DestinationType.DATA_URL,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE
      }
      // console.log(this.camera, options);
      this.camera.getPicture(options).then(b64 => {
        // console.log(b64);
        b64 = 'data:image/jpeg;base64,' + b64;
        // console.log(b64);
        let blob = this.b64toBlob(b64, "image/jpeg");
        let file = this.blobToFile(blob, "image");
        params.resolve(file);
      });
    } catch (error) {
      console.error(error);
    }

  }

  public blobToFile = (theBlob: Blob, fileName: string): File => {
    var b: any = theBlob;
    //A Blob() is almost a File() - it's just missing the two properties below which we will add
    b.lastModifiedDate = new Date();
    b.name = fileName;

    //Cast to a File() type
    return <File>theBlob;
  }

  public b64toBlob(b64Data, contentType) {
    contentType = contentType || '';
    var sliceSize = 512;
    var byteCharacters = atob(b64Data.replace(/^data:image\/(png|jpeg|jpg);base64,/, ''));
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize);

      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      var byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }

  public getPhotoUrl(user, indexImage?: number) {
    let profileImg = 'assets/imgs/default-user.png';

    if (user['loginFacebook'] !== null && user['loginFacebook'] !== undefined) {
      profileImg = `https://graph.facebook.com/${user['loginFacebook']['userID']}/picture?type=large&width=720&height=720`
    } else if (user['image'] !== null && user['image'] !== undefined &&
      user['image']['src'] !== null && user['image']['src'] !== undefined
    ) {
      profileImg = user['image']['src'];
    } else if (indexImage === 1) {
      profileImg = 'assets/imgs/default-user.png';
    } else
      profileImg = 'assets/imgs/default-user-2.png';

    return profileImg;
  }

  public urlImageToBase64(url) {
    return new Promise((resolve, reject) => {
      try {
        var xhr = new XMLHttpRequest();
        xhr.onload = function () {
          var reader = new FileReader();
          reader.onloadend = function () {
            resolve(reader.result);
          }
          reader.readAsDataURL(xhr.response);
        };
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.send();
      }
      catch (e) {
        console.error(e);
        resolve(null);
      }
    });
  }

}
