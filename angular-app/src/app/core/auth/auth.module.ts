import {ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HTTP_INTERCEPTORS} from "@angular/common/http";
import {AutoLoginHttpInterceptor} from './auto-login-http-interceptor.service';
import {AuthConfig} from './auth-config';
import { authEventInitializerProvider } from './auth-event-initializer.provider';

@NgModule({
  imports: [
    CommonModule
  ]
})
export class AuthModule { 
  static forRoot(config?: Partial<AuthConfig>): ModuleWithProviders<AuthModule> {
    const providers = [
      { provide: HTTP_INTERCEPTORS, useClass: AutoLoginHttpInterceptor, multi: true },
      authEventInitializerProvider,
      config ? [{
        provide: AuthConfig,
        useValue: AuthConfig.defaults.with(config)
      }] : []
    ];
    return {
      ngModule: AuthModule,
      providers
    };
  }
}
