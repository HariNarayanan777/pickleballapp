import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { InterceptorProvider } from '../interceptor/interceptor';
import { AuthProvider } from '../auth/auth';

declare var io;
@Injectable()
export class LiveComunicationProvider {

  public static conexion: any;
  public static eventsNotifications: any = {};
  private events: any = {};

  constructor(public http: HttpClient) {
    this.connectWithSockets();
  }

  private async getConnection() {
    if ((window as any).io === undefined) {
      let script = await this.http.get("/sails-client", { responseType: "text" }).toPromise() as string;
      new Function(script)();
      await new Promise((resolve) => { setTimeout(resolve, 500) });
      await this.getConnection();
    }
  }

  private async connectWithSockets() {
    try {
      await this.getConnection();
      // if (MyApp.hasOwnProperty('User') && MyApp.User.hasOwnProperty('token'))
      //   io.sails.query = `user=${MyApp.User.id}&token=${MyApp.User.token}`;
      // else
      //   return;

      if (LiveComunicationProvider.conexion === null || LiveComunicationProvider.conexion === undefined) {
        LiveComunicationProvider.conexion = io.sails.connect(InterceptorProvider.url, { reconnection: true });
        this.asignFunctions();
      }
    }
    catch (e) {
      console.error(e);
    }
  }

  private asignFunctions() {
    LiveComunicationProvider.conexion.on("connect", async function () {
      console.log(LiveComunicationProvider.conexion);
      // let onconnects = WebSocketsProvider.functions.filter(it => it.onConnect);
      // for(let fn of onconnects){
      //   await fn.callback();
      // }
      // HelpersProvider.me.zone.run(function(){ console.log("connect with websocket"); });
    });
    LiveComunicationProvider.conexion.on("disconnect", async function () {
      // let onconnects = WebSocketsProvider.functions.filter(it => !it.onConnect);
      // for(let fn of onconnects){
      //   await fn.callback();
      // }
      // HelpersProvider.me.zone.run(function(){ console.log("disconnect with websocket"); });
    });
  }

  public async subscribeRoom(roomName: string) {
    try {
      await this.connectWithSockets();
      LiveComunicationProvider.conexion.put(`/suscribe-room?token=${AuthProvider.me !== undefined ? AuthProvider.me.getToken() : ''}`, { roomName }, function (data) {
        console.log(data);
        //Para recibir las notificaciones para el area de notificaciones
        LiveComunicationProvider.conexion.on('message', async function (data) {
          console.log(data);
          for (let name of Object.keys(LiveComunicationProvider.eventsNotifications)) {
            if (Object.prototype.toString.call(LiveComunicationProvider.eventsNotifications[name]) === "[object Function]") {
              await LiveComunicationProvider.eventsNotifications[name](data);
            }
          }

        });
      });
    }
    catch (e) {
      console.error(e);
    }
  }

  public async subscribeEvent(nameEvent: string, callback: Function) {
    await this.connectWithSockets();
    LiveComunicationProvider.conexion.on(nameEvent, function (data) {
      console.log(`Received event ${nameEvent}:`, data);
      callback(data);
    });
  }

  public async unsubscribeEvent(nameEvent: string) {
    await this.connectWithSockets();
    LiveComunicationProvider.conexion.off(nameEvent, function (data) {
      console.log(`off event ${nameEvent}:`, data);
    });
  }

  public static async reloadGoogleplaces(sleep?: boolean) {
    if (window.hasOwnProperty("google") === true)
      return;

    sleep = sleep || false;
    if (sleep === true)
      await new Promise(function (resolve) { setTimeout(resolve, 2000) });

    try {
      let script = document.createElement("script");
      let key = "AIzaSyC6ecF25LKJaY3HpKH0iztKDDRgO60W10A";
      script.setAttribute("src", `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`);
      document.body.appendChild(script);

      await new Promise(resolve => {
        setTimeout(async function () {
          if (window.hasOwnProperty("google") === true) {
            resolve();
          } else {
            await this.reloadGoogleplaces(true);
            resolve();
          }
        }.bind(this), 1000);
      });

    }
    catch (e) {
      console.error(e);
      await this.reloadGoogleplaces(true);
    }

  }

}
