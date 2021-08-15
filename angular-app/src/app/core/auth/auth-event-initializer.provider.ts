import { APP_INITIALIZER, FactoryProvider } from '@angular/core';
import { AuthConfig } from './auth-config';
import { AuthEventPersistenceService } from './auth-event-persistence.service';

const startEventPersistance = (authService: AuthEventPersistenceService, authConfig: AuthConfig) => () => {
  if (authConfig.sendEventsToApi) {
    authService.start();  
  }
};

export const authEventInitializerProvider: FactoryProvider = {
  provide: APP_INITIALIZER,
  useFactory: startEventPersistance,
  deps: [AuthEventPersistenceService, AuthConfig],
  multi: true
};