import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {EMPTY, Observable, throwError} from 'rxjs';
import {catchError} from "rxjs/operators";
import {Router} from "@angular/router";

@Injectable()
export class BrowserRedirectHttpInterceptor implements HttpInterceptor {
    
    constructor(private route: Router) {
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        const result$ = next.handle(req).pipe(
            catchError(err => {
                const redirectUrl = window.location.origin + this.route.url.toString();
                if (err instanceof HttpErrorResponse && err.url.includes('/login')) {
                    window.location.href = window.location.origin + `/.auth/login/github?post_login_redirect_uri=${redirectUrl}`;
                    return EMPTY;
                }
                return throwError(err);
            })
        );
        
        return result$;
    }
}