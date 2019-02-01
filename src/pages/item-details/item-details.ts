import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { NavParams } from 'ionic-angular';

import { LibraryItem } from '@ionic-native/photo-library';

/**
 * este component es para visualizar una imagen de la libreria de imagenes
 */
@Component({
  selector: 'page-item-details',
  templateUrl: 'item-details.html'
})
export class ItemDetailsPage {

  public static __name = "ItemDetailsPage"

  selectedLibraryItem: LibraryItem;
  public resolve: Function;
  public reject: Function;

  public width: number;
  public height: number;
  public degrees = 0;

  constructor(public navCtrl: NavController, private navParams: NavParams) {

    this.selectedLibraryItem = navParams.get('libraryItem');

    this.resolve = this.navParams.get('resolve');
    this.reject = this.navParams.get('reject');

    this.width = this.navParams.get("width");
    this.height = this.navParams.get("height");

  }

  public addDegrees() {
    this.degrees += 90;
    console.log(this.degrees);
  }

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
    var c = document.createElement('canvas');
    var ctx = c.getContext('2d');
    let img = document.getElementById('imageSelect') as HTMLImageElement;
    c.width = img.width;
    c.height = img.height;
    ctx.drawImage(img, 0, 0, img.width, img.height);

    if( this.degrees !== 0 )
      this.drawRotated(ctx, c, img, this.degrees);
      
    var dataURL = c.toDataURL('image/jpg');
    console.log(img.width, img.height);

    //console.log(this.selectedLibraryItem, dataURL, this.width, this.height);
    c = null; ctx = null;
    this.resolve(dataURL);
    await this.navCtrl.pop();
    await this.navCtrl.pop();
    await this.navCtrl.pop();
  }

  public cancel() {
    this.navCtrl.pop();
  }

}