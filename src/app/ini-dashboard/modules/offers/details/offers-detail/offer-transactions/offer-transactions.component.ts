import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OffersService } from '@app/ini-dashboard/modules/offers/offers.service';
import { User } from '@app/_shared/models/user-model';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { environment } from '@environments/environment';
import { Observable, Subscription, startWith, switchMap, take } from 'rxjs';
import * as moment from 'moment';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-offer-transactions',
  templateUrl: './offer-transactions.component.html',
  styleUrls: ['./offer-transactions.component.css']
})
export class OfferTransactionsComponent implements OnInit {
  offerId: any;
  container: any = {};
  userInformation!: User;
  transactions!: any;

  paginationData: any = {};
  total_count = 0;
  pageSize = 10;

  emptyState = {
    title: 'No Offer Transactions',
    subTitle: 'There are no offer transactions available yet',
  };

  today = moment().format('MMM D, YYYY');
  yesterday = moment().subtract(1, 'days').format('MMM D, YYYY')
  newTransactions = new MatTableDataSource<any>([]);
  mainSubscription$: Subscription;

  @ViewChild(MatPaginator) paginator!: MatPaginator;


  constructor(
    private router: Router,
    private http: HttpClient,
    private aRoute: ActivatedRoute,
    public appContext: ApplicationContextService,
  ) {}
  ngOnInit() {
    this.offerId = this.aRoute.snapshot.paramMap.get('id');
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
        .get(`${environment.baseApiUrl}/assets/txn/${this.offerId}?page=${this.paginator.pageIndex}&perPage=${
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
          this.container['transactionsLoading'] = false;
        }
      );
  }

  objectKey(obj: any) {
    return obj ? Object.keys(obj).sort((a: any, b: any) => (b > a ? 1 : -1)) : null;
  }

  changePage(value: any): any {
    this.getTransactions();
  }

  routeToDetail(method: any) {
    this.router.navigate(['/app/transactions/detail', method.id]);
  }

  ngOnDestroy(): void {
      this.mainSubscription$.unsubscribe();
  }
}

