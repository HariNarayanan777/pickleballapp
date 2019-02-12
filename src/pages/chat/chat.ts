import { Component, ViewChild, NgZone, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavParams, ModalController, Events, Content, TextInput, ViewController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { MyApp } from '../../app/app.component';
import * as moment from 'moment';
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/fromEvent';
import { Storage } from '@ionic/storage';
import { LiveComunicationProvider } from '../../providers/live-comunication/live-comunication';
import { TabsPage } from '../tabs/tabs';
import { HelpersProvider } from '../../providers/helpers/helpers';

@IonicPage()
@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html',
})
export class ChatPage {

  @ViewChild(Content) content: Content;
  public loadingChats = false;
  private skip = 20;

  @ViewChild('chat_input') messageInput: TextInput;
  msgList = [];
  msgListObserver: Observable<Array<any>>;
  editorMsg = '';
  showEmojiPicker = false;

  public user: any;
  public to: any;
  public photo = "";
  //Para scrolling infinite to up
  // @ViewChild(Content) content: Content;

  constructor(private navParams: NavParams, private events: Events,
    private http: HttpClient, private ngZone: NgZone,
    public changeDectRef: ChangeDetectorRef, public modal: ModalController,
    private storage: Storage, private lc: LiveComunicationProvider,
    private viewCtrl: ViewController
  ) {
    this.to = this.navParams.get("user");
    this.photo = HelpersProvider.me.getPhotoUrl(this.to);
  }

  ngAfterViewInit() {
    //
    this.content.ionScrollEnd.subscribe((data) => {
      if (data) {
        if (data.scrollTop === 0 && data.directionY === "up") {
          this.loadingChats = true;
          this.loadingChatsUp();
        }
        this.ngZone.run(function () { console.log(data); });
      }
    })
  }

  public toHome(){
    TabsPage.toTab(0);
  }

  async ionViewDidEnter() {
    let userID: any = await this.storage.get("USER_ID");
    this.user = await this.http.get(`/user/${userID}`).toPromise();

    //get message list
    await this.getMsg();

    // Subscribe to received  new message events
    this.lc.subscribeEvent("new-chat", function (msg) {
      this.pushNewMsg(msg);
    }.bind(this));

    this.showEmojiPicker = false;
    this.content.resize();
    this.scrollToBottom();

  }

  private async getMsg() {
    try {
      let query = { "or": [{ from: this.user.id, to: this.to.id }, { from: this.to.id, to: this.user.id }] };
      let mgs = await this.http.get(`/chat?where=${JSON.stringify(query)}&sort=dateTime DESC&limit=20`).toPromise() as any[];
      mgs = mgs.filter(it => {
        return it.hasOwnProperty("to") && it.hasOwnProperty("from");
      });
      this.msgList = mgs.reverse();
    }
    catch (e) {
      console.error(e);
    }

  }

  private async loadingChatsUp() {
    try {
      let query = { "or": [{ from: this.user.id, to: this.to.id }, { from: this.to.id, to: this.user.id }] };
      let mgs = await this.http.get(`/chat?where=${JSON.stringify(query)}&sort=dateTime DESC&limit=20&skip=${this.skip}`).toPromise() as any[];
      mgs = mgs.filter(it => {
        return it.hasOwnProperty("from") && it.hasOwnProperty("to");
      });

      if (mgs.length === 0) {
        this.loadingChats = false;
        return;
      }

      this.msgList = mgs.reverse().concat(this.msgList);
      this.skip += 20;
      this.loadingChats = false;
    }
    catch (e) {
      console.error(e);
    }
  }

  ionViewDidLeave() {
    this.lc.unsubscribeEvent("new-chat");
  }

  public errorImage(e) {
    e.target.src = "./assets/imgs/default-user.png";
  }

  public loadImage(msg) {
    msg.loadImage = true;
  }

  // public insertMsg(msg) {
  //   //<span class="triangle"></span>
  //   if (msg.hasOwnProperty("type") && msg.type === 'image') {
  //     return `<p class="line-breaker ">${msg.text}</p>`
  //   }

  //   return `<p class="line-breaker ">${msg.text}</p>`
  // }

  onFocus() {
    this.showEmojiPicker = false;
    this.content.resize();
    this.scrollToBottom();
  }

  switchEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
    if (!this.showEmojiPicker) {
      this.messageInput.setFocus();
    }

    this.content.resize();
    this.scrollToBottom();
  }

  /**
  * @name getMsg
  * @returns {Promise<ChatMessage[]>}
  */


  /**
  * @name sendMsg
  */
  sendMsg() {
    if (!this.editorMsg.trim()) return;

    let dateTime = moment().toISOString();
    // Mock message
    let newMsgPost = {
      from: this.user.id,
      to: this.to.id,
      message: this.editorMsg,
      dateTime,
      type: "text",
      status: 'pending'
    };

    let newMsg = {
      from: this.user,
      to: this.to,
      message: this.editorMsg,
      dateTime,
      type: "text",
      status: 'pending'
    };

    this.pushNewMsg(newMsg);
    this.editorMsg = '';

    if (!this.showEmojiPicker) {
      this.messageInput.setFocus();
    }

    this.http.post("/chat", newMsgPost).toPromise()
      .then((msg: any) => {
        let index = this.getMsgIndexById(msg.dateTime);
        if (index !== -1) {
          this.msgList[index].status = 'success';
        }
      })
  }

  // public async sendMgsWitImage() {
  //   try {

  //     let image = await this.helper.Camera({});
  //     let preview = this.modal.create(PreviewImageChatComponent, { image });
  //     image = null;
  //     preview.present();
  //     preview.onDidDismiss(this.sendImage.bind(this));
  //   }
  //   catch (e) {
  //     console.error(e);
  //   }
  // }

  // private async sendImage(data) {
  //   if (data === undefined || data == null)
  //     return;

  //   try {
  //     let msg = {
  //       user: MyApp.User.id,
  //       role: MyApp.User.role.name,
  //       text: data.comment || "",
  //       username: MyApp.User.username,
  //       team: MyApp.User.team,
  //       "is": "message",
  //       image: data.image
  //     };

  //     msg = await this.http.post("/api/chat/image", msg).toPromise() as any;

  //   }
  //   catch (e) {
  //     console.error(e);
  //   }
  // }

  // public urlImg(id: string) {
  //   return interceptor.transformUrl(`/api/image/messages/${id}`);
  // }

  /**
  * @name pushNewMsg
  * @param msg
  */
  async pushNewMsg(msg) {

    let index = this.getMsgIndexById(msg.dateTime);
    if (index === -1) {
      this.scrollToBottom();
      this.ngZone.run(function () { this.msgList.push(msg); }.bind(this))
    }

  }

  getMsgIndexById(id: string) {
    return this.msgList.findIndex(e => e.dateTime === id)
  }

  scrollToBottom() {
    setTimeout(() => {
      if (this.content.scrollToBottom) {
        this.content.scrollToBottom();
      }
    }, 400)
  }

  public customTrackBy(index: number, obj: any): any {
    return index;
  }

  // public showIfImage(msg) {
  //   if (msg.type === "image") {
  //     let img = new Image();
  //     let src = this.urlImg(msg.id);
  //     img.setAttribute("src", src);
  //     const imageViewer = this.imageViewerCtrl.create(img);
  //     imageViewer.present();
  //   }
  // }


}
