import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {HTTP_INTERCEPTORS} from "@angular/common/http";
import { AutoLoginHttpInterceptor} from './auto-login-http-interceptor.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AutoLoginHttpInterceptor, multi: true },
  ],
})
export class AuthModule { }
