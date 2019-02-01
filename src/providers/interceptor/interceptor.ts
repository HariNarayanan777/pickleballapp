import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs/Observable'

@Injectable()
export class InterceptorProvider implements HttpInterceptor {

    constructor() { }
    public static url = 'http://138.68.19.227:8781'; // "http://localhost:8781";

    // Intercepts all HTTP requests!
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let event: HttpRequest<any>;
        let data = localStorage.getItem('login');
        if (data) {
            let json = JSON.parse(data);
            let token = json['token'];

            event = req.clone({
                url: InterceptorProvider.url + req.url,
                setHeaders: {
                    'token': `${token}`
                }
            });
        } else {
            event = req.clone({
                url: InterceptorProvider.url + req.url
            });
        }

        return next.handle(event);

    }

    public static tranformUrl(url: string) {
        let data = localStorage.getItem('login');
        if (data) {
            let json = JSON.parse(data);
            let token = json['token'];

            return InterceptorProvider.url + url + "?token=" + token;
        } else {

            return InterceptorProvider.url + url;
        }
    }


}