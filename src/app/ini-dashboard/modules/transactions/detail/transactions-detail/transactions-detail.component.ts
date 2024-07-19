import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OffersService } from '@app/ini-dashboard/modules/offers/offers.service';
import { User } from '@app/_shared/models/user-model';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { environment } from '@environments/environment';
import { take } from 'rxjs';

@Component({
  selector: 'app-transactions-detail',
  templateUrl: './transactions-detail.component.html',
  styleUrls: ['./transactions-detail.component.scss']
})
export class TransactionsDetailComponent implements OnInit {
  id: any;
  container: any = {};
  userInformation!: User;
  transactions!: any;
  media: any = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private offerService: OffersService,
    public appContext: ApplicationContextService,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    this.getTransactionDetail();
  }


  getTransactionDetail() {
    this.container['transactionsLoading'] = true;
    this.http
      .get(`${environment.baseApiUrl}/transactions/${this.id}`)
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          this.transactions = response.data;
          this.media = this.transactions?.TxnHeader?.Right?.Media?.filter((item: any) => {
            return item?.type?.name === 'logo'
          });
          this.container['transactionsLoading'] = false;
        },
        (errResp) => {
          this.container['transactionsLoading'] = false;
        }
      );
  }

}
