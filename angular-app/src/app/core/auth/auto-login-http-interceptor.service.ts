import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {EMPTY, from, Observable, throwError} from 'rxjs';
import {catchError, mergeMapTo} from "rxjs/operators";
import {Router} from "@angular/router";
import {AuthService} from './auth.service';

@Injectable()
export class AutoLoginHttpInterceptor implements HttpInterceptor {

    constructor(private route: Router, private authService: AuthService) {
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        const result$ = next.handle(req).pipe(
            catchError(err => {
                if (err instanceof HttpErrorResponse && err.status === 401) {
                    const redirectUrl = this.route.url.toString();
                    return from(this.authService.login({ redirectUrl })).pipe(
                        mergeMapTo(EMPTY) // make typescript happy!
                    );
                }
                return throwError(err);
            })
        );

        return result$;
    }
}
