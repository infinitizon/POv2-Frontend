import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionsComponent } from './transactions.component';
import { SharedModule } from '@app/_shared/shared.module';
import { TransactionsRoutingModule } from './transactions-routing.module';
import { ViewTransactionsComponent } from './view/view-transactions/view-transactions.component';
import { TransactionsDetailComponent } from './detail/transactions-detail/transactions-detail.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    TransactionsRoutingModule
  ],
  declarations: [
    TransactionsComponent,
    ViewTransactionsComponent,
    TransactionsDetailComponent
  ]
})
export class TransactionsModule { }
