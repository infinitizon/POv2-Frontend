import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IniDashboardComponent } from './ini-dashboard.component';
import { AuthGuard } from '@app/_shared/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: IniDashboardComponent,
    children: [
      {
        path: 'home',
        loadChildren: () => import('./modules/home/home.module').then(m => m.HomeModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'transactions',
        loadChildren: () => import('./modules/transactions/transactions.module').then(m => m.TransactionsModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'faq',
        loadChildren: () => import('./modules/faq/faq.module').then(m => m.FaqModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'help',
        loadChildren: () => import('./modules/help/help.module').then(m => m.HelpModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'offers',
        loadChildren: () => import('./modules/offers/offers.module').then(m => m.OffersModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'settings',
        loadChildren: () => import('./modules/settings/settings.module').then(m => m.SettingsModule),
        canActivate: [AuthGuard]
      },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IniDashboardRoutingModule { }
