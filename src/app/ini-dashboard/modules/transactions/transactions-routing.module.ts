import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TransactionsComponent } from './transactions.component';
import { ViewTransactionsComponent } from './view/view-transactions/view-transactions.component';
import { TransactionsDetailComponent } from './detail/transactions-detail/transactions-detail.component';

const routes: Routes = [
  {
    path: '',
    component: TransactionsComponent,
    children: [
      {
        path: 'view',
        component: ViewTransactionsComponent
      },
      {
        path: 'detail/:id',
        component: TransactionsDetailComponent
      },
      { path: '', redirectTo: 'view', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/app/transactions/view', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransactionsRoutingModule { }
