import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { LibraryItem } from '@ionic-native/photo-library';
import { DomSanitizer } from '@angular/platform-browser';
import { AngularCropperjsComponent } from 'angular-cropperjs';
import { File, IWriteOptions } from '@ionic-native/file';

@IonicPage()
@Component({
  selector: 'page-image-view',
  templateUrl: 'image-view.html',
})
export class ImageViewPage {

  public static __name = "ImageViewPage"

  @ViewChild('angularCropper') public angularCropper: AngularCropperjsComponent;

  selectedLibraryItem: LibraryItem;
  public resolve: Function;
  public reject: Function;

  public width: number;
  public height: number;
  public degrees = 0;

  private navigator = false;

  image: any = '';

  public resize = false;

  public cropperOptions = {
    dragMode: 'crop',
    aspectRatio: 2 / 2,
    autoCrop: true,
    movable: true,
    zoomable: false,
    scalable: false,
    autoCropArea: 0.8,
    checkCrossOrigin: false
  };

  pop: number;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public domSanitizationService: DomSanitizer, public file: File,
    private platform: Platform
  ) {

    if (navParams.get('libraryItem') !== undefined) {
      this.selectedLibraryItem = navParams.get('libraryItem');
    } else {
      this.image = navParams.get("image");
    }

    this.resize = this.navParams.get("resize");
    this.resolve = this.navParams.get('resolve');
    this.reject = this.navParams.get('reject');
    this.width = this.navParams.get("width");
    this.height = this.navParams.get("height");
    this.pop = this.navParams.get("pop");
    this.navigator = this.navParams.get("navigator");
  }

  public addDegrees() {
    this.degrees += 90;
    // console.log(this.degrees);
  }

  // async ngAfterViewInit() {
  //   console.log("load");
  //   if (this.resize === true) {
  //     await this.angularCropper.ready.subscribe(od => {
  //       console.log("ready", od)
  //     }, err => {
  //       console.error(err);
  //     })
  //     console.log("loaded");
  //   }
  // }

  public drawRotated(context, canvas, image, degrees) {
    context.clearRect(0, 0, canvas.width, canvas.height);

    // save the unrotated context of the canvas so we can restore it later
    // the alternative is to untranslate & unrotate after drawing
    context.save();

    // move to the center of the canvas
    context.translate(canvas.width / 2, canvas.height / 2);

    // rotate the canvas to the specified degrees
    context.rotate(degrees * Math.PI / 180);

    // draw the image
    // since the context is rotated, the image will be rotated also
    context.drawImage(image, -image.width / 2, -image.width / 2);

    // we’re done with the rotating so restore the unrotated context
    context.restore();
  }

  public async selectd() {
    try {
      var c = document.createElement('canvas');
      var ctx = c.getContext('2d');

      let img:HTMLImageElement;
      if (this.resize === true) {
        //get cropped image
        let croppedImgB64String: string = this.getCropper() as string;
        img = new Image();
        img.src = croppedImgB64String;
        await new Promise(function (resolve, reject) {
          let trigger = false;

          img.onload = function () { resolve(); trigger = true; };
          setTimeout(function () {
            if (trigger === false)
              reject();
            this.reject("not load image cropped!");
          }.bind(this), 5000);
        }.bind(this));

      } else {
        img = document.getElementById("imageSelect") as HTMLImageElement;
      }

      let width = img.naturalWidth,
      height = img.naturalHeight;
      c.width = width;
      c.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      if (this.degrees !== 0)
        this.drawRotated(ctx, c, img, this.degrees);

      //Guardamos localmente la foto si es una que se tomo con la camara
      // try {
      //   if (this.image !== "") {
      //     await new Promise(async function (resolve, reject) {
      //       await this.saveCanvasImage(c, resolve, reject);
      //     }.bind(this));
      //   }
      // }
      // catch (e) {
      //   console.error(e);
      // }

      var dataURL = c.toDataURL('image/jpeg');
      console.log(this.width, this.height);

      //console.log(this.selectedLibraryItem, dataURL, this.width, this.height);
      c = null; ctx = null;
      this.resolve(dataURL);
      if (this.navigator === true) {
        await this.navCtrl.pop();
        return;
      }

      if (this.pop === 3) {
        await this.navCtrl.pop();
        await this.navCtrl.pop();
        await this.navCtrl.pop();
      } else {
        await this.navCtrl.pop();
        await this.navCtrl.pop();
      }
    }
    catch (e) {
      console.error(e);
    }
  }

  private getCropper(): String {
    let result: String;
    try {
      result = this.angularCropper.cropper.getCroppedCanvas().toDataURL('image/jpeg', 0.8);
    }
    catch (e) {
      console.error(e);

      //Si el plugin no funciona obtenemos las coordenas para
      //hacer el recortes en un canvas
      let node = document.querySelector(".cropper-crop-box") as any;
      let matrix = new WebKitCSSMatrix(window.getComputedStyle(node).webkitTransform);
      let left = node.offsetLeft + matrix.m41;
      let top = node.offsetTop + matrix.m42;
      let clientRect = node.getClientRects();
      let width = clientRect.item(0).width;
      let height = clientRect.item(0).height;

      //Creamos el canvas para cargar el image data
      let image = document.querySelector(".cropper-wrap-box>.cropper-canvas>img") as HTMLImageElement;
      var canvas1 = document.createElement("canvas");
      canvas1.width = image.width;
      canvas1.height = image.height;
      var ctx1 = canvas1.getContext("2d");
      ctx1.drawImage(image, 0, 0, image.width, image.height);
      let imageData = ctx1.getImageData(left, top, width, height);

      // //Y realizamos el recorte en otro canvas
      var canvas2 = document.createElement("canvas");
      canvas2.width = width;
      canvas2.height = height;
      var ctx2 = canvas2.getContext("2d");
      ctx2.rect(0, 0, width, height);
      ctx2.fillStyle = 'white';
      ctx2.fill();
      ctx2.putImageData(imageData, 0, 0);

      result = canvas2.toDataURL("image/jpg");
      canvas1 = null;
      canvas2 = null;
    }

    return result;
  }

  public cancel() {
    this.navCtrl.pop();
  }

  private async saveCanvasImage(canvasElement: HTMLCanvasElement, resolve, reject) {
    if (!this.platform.is("cordova")) {
      return resolve();
    }

    var dataUrl = canvasElement.toDataURL();

    let name = new Date().getTime() + '.png';
    let path = this.file.externalRootDirectory + "/LockerRoom";
    try {
      await this.file.createDir(this.file.externalRootDirectory, "LockerRoom", false);
    }
    catch (e) {
      console.error(e);
    }

    let options: IWriteOptions = { replace: true };

    var data = dataUrl.split(',')[1];
    let blob = this.b64toBlob(data, 'image/png');

    this.file.writeFile(path, name, blob, options).then(res => {
      console.log("save image", res);
      resolve();
    }, err => {
      console.log('error in save image', err);
      reject(err);
    });
  }

  // https://forum.ionicframework.com/t/save-base64-encoded-image-to-specific-filepath/96180/3
  b64toBlob(b64Data, contentType) {
    contentType = contentType || '';
    var sliceSize = 512;
    var byteCharacters = atob(b64Data);
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


}
