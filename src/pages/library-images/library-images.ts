import { Component, NgZone } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { Platform, ToastController, IonicPage, NavController, NavParams } from 'ionic-angular';

import { PhotoLibrary, LibraryItem } from '@ionic-native/photo-library';
import { ImageViewPage } from '../image-view/image-view';
// import { UploadMultiplesImagesPage } from '../upload-multiples-images/upload-multiples-images';

const THUMBNAIL_WIDTH = 250;
const THUMBNAIL_HEIGHT = 150;

/**
 * para ver las imagenes que estan dentro de library imagenes del telefono
 */

@IonicPage()
@Component({
  selector: 'page-library-images',
  templateUrl: 'library-images.html',
})
export class LibraryImagesPage {

  public static __name = "LibraryImagesPage"

  thumbnailWidth = THUMBNAIL_WIDTH + 'px';
  thumbnailHeight = THUMBNAIL_HEIGHT + 'px';
  library;

  public resolve: Function;
  public reject: Function;
  public listMaster = [];

  private start: number = 0;
  private end: number = 10;

  private width: number;
  private height: number;

  private resize = false;

  private multiples = false;
  private id = "";
  public selects: LibraryItem[] = [];
  public pressEvent = 0;

  constructor(public navCtrl: NavController, private photoLibrary: PhotoLibrary,
    private platform: Platform, private cd: ChangeDetectorRef,
    private toastCtrl: ToastController, public navParams: NavParams, 
    public zone: NgZone
    ) {

    if (this.navParams.get("multi") !== undefined) {
      this.multiples = true;
      this.id = this.navParams.get("id");
    }

    this.resolve = this.navParams.get('resolve');
    this.reject = this.navParams.get('reject');
    this.width = this.navParams.get("width");
    this.height = this.navParams.get("height");
    this.resize = this.navParams.get("resize");
    console.log("resize ", this.resize);

    this.library = [];
    this.fetchPhotos();

  }

  fetchPhotos() {

    this.platform.ready().then(() => {

      this.library = [];
      this.listMaster = [];

      this.photoLibrary.getLibrary({ thumbnailWidth: THUMBNAIL_WIDTH, thumbnailHeight: THUMBNAIL_HEIGHT, quality: 0.3/*, chunkTimeSec: 0.3*/ }).subscribe({
        next: (chunk) => {
          this.listMaster = this.listMaster.concat(chunk);
        },
        error: (err: string) => {
          if (err.startsWith('Permission')) {
            this.photoLibrary.requestAuthorization({ read: true })
              .then(this.fetchPhotos.bind(this))
              .catch(function (err) {
                let toast = this.toastCtrl.create({
                  message: `requestAuthorization error: ${err}`,
                  duration: 6000,
                });
                toast.present();
              }.bind(this));

          } else { // Real error
            let toast = this.toastCtrl.create({
              message: `getLibrary error: ${err}`,
              duration: 6000,
            });
            toast.present();
          }
        },
        complete: () => {
          // Library completely loaded
          this.library = this.listMaster.slice(this.start, this.end); // To take top 10 images
          this.cd.detectChanges();
          this.start = this.end;
          this.end += this.end;
        }
      });

    });

  }

  itemTapped(event, libraryItem) {
    if (this.multiples === true) {
      return this.existRemove(libraryItem);
    }
    this.navCtrl.push(ImageViewPage, {
      libraryItem: libraryItem,
      resolve: this.resolve,
      reject: this.reject,
      width: this.width,
      height: this.height,
      resize: this.resize,
      pop: 3
    });
  }

  public trackById(index: number, libraryItem: LibraryItem): string { return libraryItem.id; }

  public doInfinite(infiniteScroll) {
    //console.log(infiniteScroll, this.start, this.listMaster.length);
    if (this.start > this.listMaster.length) { infiniteScroll.complete(); return; }

    let news = this.listMaster.slice(this.start, this.end); // To take top 10 images
    this.zone.run(() => {
      for (let t of news) {
        this.library.push(t);
      }
      setTimeout(function () {
        infiniteScroll.complete();
      }, 1500);
    });

    this.start = this.end;
    this.end += this.end;
  }

  //#region para la selecion multiple
  public initPress(libraryItem: LibraryItem) {
    if (this.multiples === false) return;
    this.pressEvent = setTimeout(function () {
      this.zone.run(function () {
        this.selects.push(libraryItem);
      }.bind(this));
    }.bind(this), 1300);
  }

  public finishPress() {
    clearTimeout(this.pressEvent);
  }

  public select(libraryItem: LibraryItem) {
    let index = this.selects.findIndex(it => {
      return it.id === libraryItem.id;
    });
    return index !== -1;
  }

  public existRemove(libraryItem: LibraryItem) {
    let index = this.selects.findIndex(it => {
      return it.id === libraryItem.id;
    });
    if (index !== -1) {
      if (this.selects.length === 1) {
        this.selects = [];
      } else {
        this.selects.splice(index, 1);
      }
    } else {
      this.selects.push(libraryItem);
    }
    this.zone.run(function () {
      console.log("task");
    })
  }

  // public toUpload() {
  //   this.navCtrl.push(UploadMultiplesImagesPage, { images: this.selects, id: this.id });
  // }
  //#endregion
}
