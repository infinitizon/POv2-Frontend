import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { OffersService } from '@app/ini-dashboard/modules/offers/offers.service';
import { User } from '@app/_shared/models/user-model';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { environment } from '@environments/environment';
import { Observable, Subscription, startWith, switchMap, take } from 'rxjs';
import * as moment from 'moment';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-view-transactions',
  templateUrl: './view-transactions.component.html',
  styleUrls: ['./view-transactions.component.scss'],
})
export class ViewTransactionsComponent implements OnInit, OnDestroy {


  container: any = {};
  userInformation!: User;
  transactions!: any;

  paginationData: any = {};
  total_count = 0;
  pageSize = 10;

  emptyState = {
    title: 'No Transactions',
    subTitle: 'There are no transactions available yet',
  };

  today = moment().format('MMM D, YYYY');
  yesterday = moment().subtract(1, 'days').format('MMM D, YYYY')
  newTransactions = new MatTableDataSource<any>([]);
  mainSubscription$: Subscription;
  media: any = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;


  constructor(
    private router: Router,
    private offerService: OffersService,
    public appContext: ApplicationContextService,
    private http: HttpClient,
    private _changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.appContext
      .getUserInformation()
      .pipe(take(1))
      .subscribe({
        next: (data: User) => {
          this.userInformation = data;

        },
      });
      this.container['transactionsLoading'] = true;
  }


  ngAfterViewInit() {
    this.newTransactions.paginator = this.paginator;
    this.getTransactions();
  }


  getTransactions() {
    this.mainSubscription$ = this.paginator.page
    .pipe(
      startWith({}),
      switchMap(() => {
        this.container['transactionsLoading'] = true;
      return  this.http
        .get(`${environment.baseApiUrl}/transactions?page=${this.paginator.pageIndex}&perPage=${
          this.paginator.pageSize}`)

      })).subscribe(
        (response: any) => {
          this.newTransactions = new MatTableDataSource<any>(response.data);
          this.transactions = response.data;
          this.transactions = this.transactions.map((t: any) => {
            t.createdAt = moment(t.createdAt).format('MMM D, YYYY');
            return t;
          });
          this.transactions = this.transactions?.sort((a: any, b: any) => (a['createdAt'] > b['createdAt'] ? 1 : -1));
          this.transactions = this.transactions?.reduce(
            (prev: any, now: any) => {
              if (!prev[now['createdAt']]) {
                prev[now['createdAt']] = [];
              }
              prev[now['createdAt']].push(now);
              return prev;
            },
            {}
          );


          this.total_count = response.total;
          this.container['transactionsLoading'] = false;
        },
        (errResp) => {
          // this.container['paymentLoading'] = false;
        }
      );
    // this.paginator.page
    // .pipe(
    //   startWith({}),
    //   switchMap(() => {
    //   return this.http
    //   .get(
    //     `${environment.baseApiUrl}/transactions?page=${this.paginator.pageIndex + 1}&perPage=${this.paginator.pageSize}`
    //   )
    //   .subscribe(
    //     (response: any) => {
    //       this.newTransactions = response.data.data;
    //       this.transactions = response.data.data;
    //       this.transactions = this.transactions.map((t: any) => {
    //         t.createdAt = moment(t.createdAt).format('MMM D, YYYY');
    //         return t;
    //       });

    //       this.transactions = this.transactions?.sort((a: any, b: any) => (a['createdAt'] > b['createdAt'] ? 1 : -1));

    //       this.transactions = this.transactions?.reduce(
    //         (prev: any, now: any) => {
    //           if (!prev[now['createdAt']]) {
    //             prev[now['createdAt']] = [];
    //           }
    //           prev[now['createdAt']].push(now);
    //           return prev;
    //         },
    //         {}
    //       );
    //       this.paginationData.currentPage = response.data.currentPage;
    //       this.paginationData.totalPages = response.data.totalPages;
    //       this.container['transactionsLoading'] = false;
    //     },
    //     (errResp) => {
    //       this.container['transactionsLoading'] = false;
    //     }
    //   );
    //    } ))
  }


  returnImage(image) {
   this.media = image?.filter((item: any) => {
      return item?.type?.name === 'logo'
    });
    return this.media[0]?.response;
  }

  objectKey(obj: any) {
    return obj ? Object.keys(obj).sort((a: any, b: any) => (b > a ? 1 : -1)) : null;
  }

  changePage(value: any): any {
    // this.page = value;
    this.getTransactions();
  }

  routeToDetail(method: any) {
    // if(method.status === 'pending') {
    //      this.router.navigate(['/app/offers/gateway-payment']);
    //      this.offerService.gatewayDetails = {
    //       currency: 'NGN',
    //       payment_method: method?.TxnHeader?.channel === 'paystack' ||  method?.TxnHeader?.channel === 'flutterwave' ||  method?.TxnHeader?.channel === 'qtsquad' ? 'online' : 'bank',
    //       id: method.id,
    //       formData: method
    //    }
    //     } else {
    this.router.navigate(['/app/transactions/detail', method.id]);
    // }
  }

  ngOnDestroy(): void {
      this.mainSubscription$.unsubscribe();
  }
}
