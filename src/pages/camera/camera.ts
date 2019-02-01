import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, LoadingController, Platform } from 'ionic-angular';
import { CameraPreview, CameraPreviewPictureOptions, CameraPreviewOptions } from '@ionic-native/camera-preview';
import { PhotoLibrary } from '@ionic-native/photo-library';
import { LibraryImagesPage } from '../library-images/library-images';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { ImageViewPage } from '../image-view/image-view';
import { HelpersProvider } from '../../providers/helpers/helpers';
//declare var cordova: any; // global variable for paths

/**
 * este es una page donde poder visualizar correctamente la camera
 */
@IonicPage()
@Component({
  selector: 'page-camera',
  templateUrl: 'camera.html',
})
export class CameraPage {

  public static __name = "CameraPage"

  private picture: string;
  public resolve: Function;
  public reject: Function;

  private width: number;
  private height: number;
  private resize: boolean;
  //private quality: number;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public toastCtrl: ToastController, public cameraPreview: CameraPreview,
    public photoLibrary: PhotoLibrary, public loadCtrl: LoadingController,
    public camera: Camera, public platform: Platform
  ) {

    this.resolve = this.navParams.get("resolve");
    this.reject = this.navParams.get("reject");
    this.width = this.navParams.get("width");
    this.height = this.navParams.get("height");
    this.resize = this.navParams.get("resize");
    //this.quality = this.navParams.get("quality");

  }

  /*moveFileToExternalStorage(fileName: string) {
    // Determine paths
    let externalStoragePath: string =
      cordova.file.externalApplicationStorageDirectory;
    let currentPath: string =
      cordova.file.applicationStorageDirectory + "files/";

    // Extract filename
    fileName = fileName.split("/").pop();


  }*/

  //Para tomar la foto
  takePicture() {
    const pictureOpts: CameraPreviewPictureOptions = {
      quality: 100
    }

    this.cameraPreview.takePicture(pictureOpts).then((imageData) => {
      this.picture = 'data:image/jpeg;base64,' + imageData;
      this.cameraPreview.stopCamera();
      let parameters: any = {
        resolve: this.resolve, reject: this.reject,
        width: this.width, height: this.height
      };
      if (this.resize === true) {
        parameters.resize = true;
      }
      parameters.image = this.picture;
      parameters.pop = 2;
      this.navCtrl.push(ImageViewPage, parameters);
    }, (err) => {
      console.log(err);
      this.picture = null;
    });
  }

  changeEffect() {
    // Create an array with 5 effects
    let effects: any = ['none', 'negative', 'mono', 'aqua', 'sepia'];

    let randomEffect: string = effects[Math.floor(Math.random() * effects.length)];
    this.cameraPreview.setColorEffect(randomEffect);
  }

  //Para iniciar la camera cada ves que se entra a la page
  // async ionViewDidLoad() {
  //   console.log("ionViewDidLoad " + Math.random());

  // let previewOtions: CameraPreviewOptions = {
  //   x: 0,
  //   y: 56,
  //   width: window.screen.width,
  //   height: window.screen.height - 156,
  //   camera: 'rear',
  //   tapPhoto: false,
  //   previewDrag: false,
  //   toBack: false,
  //   alpha: 1,
  //   tapToFocus: true
  // };

  //   try {
  //     await this.cameraPreview.startCamera(previewOtions);
  //   } catch (e) {
  //     console.error(e);
  //     await this.cameraPreview.show();
  //   }

  // }

  //Para iniciar la camera cada ves que se entra a la page sin haberla cerrado
  async ionViewWillEnter() {


    try {
      
      console.log(this.cameraPreview, "ionViewWillEnter " + Math.random());
      let previewOtions: CameraPreviewOptions = {
        x: 0,
        y: 56,
        width: HelpersProvider.me.platform.width(),
        height: HelpersProvider.me.platform.height() - 180,
        camera: 'rear',
        tapPhoto: false,
        previewDrag: false,
        toBack: false,
        alpha: 1,
        tapToFocus: true
      };

      await this.cameraPreview.startCamera(previewOtions);
      await this.cameraPreview.show();
    } catch (e) {
      console.error(e);
      await this.cameraPreview.show();
    }
    await this.cameraPreview.setFlashMode(this.cameraPreview.FLASH_MODE.AUTO);
  }

  //para detener la camera cuando se cierra la pagina pop
  ionViewDidLeave() {
    this.cameraPreview.stopCamera();
    console.log("ionViewDidLeave " + Math.random());
  }

  //para detener la camera cuando se oculta la pagina push
  ionViewWillUnload() {
    console.log("ionViewWillUnload " + Math.random());
    this.resolve();
  }

  public toBack() {
    this.cameraPreview.stopCamera();
    this.navCtrl.pop();
  }

  //mostrar la libraria de fotos
  public async toLibrary() {

    if (this.platform.is("cordova") === true) {
      let options: CameraOptions = {
        quality: 100,
        destinationType: this.camera.DestinationType.DATA_URL,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE,
        sourceType: this.camera.PictureSourceType.PHOTOLIBRARY
      };
      this.camera.getPicture(options).then(async function (imageData) {
        // imageData is either a base64 encoded string or a file URI
        // If it's base64:
        let parameters: any = {
          resolve: this.resolve, reject: this.reject,
          width: this.width, height: this.height
        };
        if (this.resize === true) {
          parameters.resize = true;
        }
        parameters.image = 'data:image/jpeg;base64,' + imageData
        this.navCtrl.push(ImageViewPage, parameters);

      }.bind(this), function (err) {
        console.error(err);
      }.bind(this));

    } else {
      this.cameraPreview.hide();
      let parameters: any = {
        resolve: this.resolve, reject: this.reject,
        width: this.width, height: this.height
      };
      if (this.resize === true) {
        parameters.resize = true;
      }
      this.navCtrl.push(LibraryImagesPage, parameters);
    }

  }

  //Para cambiar a alternativa camera
  public switchCamera() {
    this.cameraPreview.switchCamera();
  }

  //esto no trabaja quizas lo elimine en el futuro nesesito probar con otros telefonos
  public async switchFlash() {
    let flash = await this.cameraPreview.getFlashMode();
    console.log(flash);
    if (flash == this.cameraPreview.FLASH_MODE.OFF) {
      await this.cameraPreview.setFlashMode(this.cameraPreview.FLASH_MODE.ON);
    } else {
      await this.cameraPreview.setFlashMode(this.cameraPreview.FLASH_MODE.OFF);
    }
    flash = await this.cameraPreview.getFlashMode();
    console.log(flash);
  }
}
