import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs/Observable'
import { AuthProvider } from '../auth/auth';

@Injectable()
export class InterceptorProvider implements HttpInterceptor {

    constructor() { }
    public static url = 'https://pickleweb.senorcoders.com'; // "http://localhost:8781";

    // Intercepts all HTTP requests!
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let event: HttpRequest<any>;
        if (AuthProvider.me !== undefined && AuthProvider.me.getToken() !== null) {
            event = req.clone({
                url: InterceptorProvider.url + req.url,
                setHeaders: {
                    'token': AuthProvider.me.getToken()
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
        if (AuthProvider.me !== undefined && AuthProvider.me.getToken() !== null) {
            return InterceptorProvider.url + url + "?token=" + AuthProvider.me.getToken();
        } else {
            return InterceptorProvider.url + url;
        }
    }


}