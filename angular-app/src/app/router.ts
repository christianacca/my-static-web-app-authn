import {Routes} from '@angular/router';
import {AboutComponent} from './about.component';
import {AuthGuard, NotFoundComponent} from './core';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'about' },
  {
    path: 'products',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./products/products.module').then((m) => m.ProductsModule),
  },
  { path: 'about', component: AboutComponent },
  { path: '**', component: NotFoundComponent },
];
