import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from './_shared/components/page-not-found/page-not-found.component';
import { HomePageComponent } from './ini-website/auth/home-page/home-page.component';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./ini-website/ini-website.module').then(m => m.IniWebsiteModule)
  },
  {
    path: 'app',
    loadChildren: () => import('./ini-dashboard/ini-dashboard.module').then(m => m.IniDashboardModule)
  },
  { path: 'rights', component: HomePageComponent },
  { path: '**', component: PageNotFoundComponent },
];
@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled', useHash: false })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
