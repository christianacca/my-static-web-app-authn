import {ErrorHandler, Injectable, OnDestroy} from '@angular/core';
import {AuthService} from './auth.service';
import {catchError, concatMap} from 'rxjs/operators';
import {EMPTY, Observable, Subscription} from "rxjs";
import {AuthEvent} from './auth-event';
import {AuthConfig} from './auth-config';

@Injectable({
  providedIn: 'root'
})
export class AuthEventPersistenceService implements OnDestroy {
  
  private subscription = new Subscription();
  private saves$: Observable<any>

  constructor(authService: AuthService, errorHandler: ErrorHandler, private config: AuthConfig) {

    this.saves$ = authService.events$.pipe(
      concatMap(evt => this.sendEvent(evt).pipe(
        catchError(err => {
          errorHandler.handleError(err);
          return EMPTY;
        })
      ))
    );
  }
  
  start() {
    this.subscription.add(this.saves$.subscribe());
  }
  
  /** 
   * Send the event to the api. The default implementation is send event using the `navigator.sendBeacon`
   */
  protected sendEvent(evt: AuthEvent) : Observable<any> {
    const payload = this.prepareEventPayload(evt);
    // `sendBeacon` is a more reliable way of ensuring the http request is made even when app page is unloaded
    navigator.sendBeacon(this.config.eventsApiUrl, JSON.stringify(payload));
    return EMPTY;
  }
  
  /**
   * Override this method if you need to prepare the modify the data sent to the api
   */
  protected prepareEventPayload(evt: AuthEvent): any {
    return evt;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
