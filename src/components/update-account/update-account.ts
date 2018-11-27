import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';

@Component({
  selector: 'update-account',
  templateUrl: 'update-account.html'
})
export class UpdateAccountComponent {


  constructor(public viewCtrl: ViewController) {
    console.log('Hello UpdateAccountComponent Component');
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}
