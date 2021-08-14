import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import {RouterModule} from '@angular/router';

import {routes} from './router';
import {AppComponent} from './app.component';
import {AppStoreModule} from './store/store.module';
import {AboutComponent} from './about.component';
import {externalModules} from './build-specific';
import {AuthModule, declarations} from './core';

@NgModule({
  declarations: [AppComponent, AboutComponent, declarations],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' }),
    AppStoreModule,
    externalModules,
    AuthModule.forRoot()
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
