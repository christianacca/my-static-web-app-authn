import {Component, OnInit} from '@angular/core';
import {AuthService, UserInfo} from '../auth';

@Component({
  selector: 'app-nav',
  template: `
    <nav class="menu">
      <p class="menu-label">Menu</p>
      <ul class="menu-list">
        <a routerLink="/products" routerLinkActive="router-link-active">
          <span>Products</span>
        </a>
        <a routerLink="/about" routerLinkActive="router-link-active">
          <span>About</span>
        </a>
      </ul>
    </nav>
    <nav class="menu auth">
      <p class="menu-label">Auth</p>
      <div class="menu-list auth">
        <ng-container *ngIf="!userInfo; else logout">
          <ng-container *ngFor="let provider of providers">
            <a (click)="signIn(provider.key)">{{provider.name}}</a>
          </ng-container>
        </ng-container>
        <ng-template #logout>
          <a (click)="signOut()">Logout</a>
        </ng-template>
      </div>
    </nav>
    <div class="user" *ngIf="userInfo">
      <p>Welcome</p>
      <p>{{ userInfo?.userDetails }}</p>
      <p>{{ userInfo?.identityProvider }}</p>
    </div>
  `,
})
export class NavComponent implements OnInit {
  userInfo: UserInfo;
  providers = this.authService.identityProviders;
  
  private redirectUrl = '/about';
  
  constructor(private authService: AuthService) {
  }

  async ngOnInit() {
    this.userInfo = await this.authService.userLoaded$.toPromise();
  }

  signIn(identityProvider: string) {
    this.authService.login({ identityProvider, redirectUrl: this.redirectUrl } );
  }

  signOut() {
    this.authService.logout(this.redirectUrl);
  }
}
