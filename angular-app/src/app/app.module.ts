import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';

import {routes} from './router';
import {AppComponent} from './app.component';
import {AppStoreModule} from './store/store.module';
import {AboutComponent} from './about.component';
import {RouterModule} from '@angular/router';
import {externalModules} from './build-specific';
import {AuthConfig, AuthModule, declarations} from './core';

const auth0Idp = { key: 'auth0', name: 'Auth0'};

@NgModule({
  declarations: [AppComponent, AboutComponent, declarations],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' }),
    AppStoreModule,
    externalModules,
    AuthModule.forRoot({
      availableIdentityProviders: [
          ...AuthConfig.defaults.availableIdentityProviders,
        auth0Idp
      ],
      defaultIdentityProviderKey: auth0Idp.key
    })
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
