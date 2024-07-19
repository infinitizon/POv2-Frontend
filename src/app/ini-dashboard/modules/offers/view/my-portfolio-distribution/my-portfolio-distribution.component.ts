import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-my-portfolio-distribution',
  templateUrl: './my-portfolio-distribution.component.html',
  styleUrls: ['./my-portfolio-distribution.component.scss']
})
export class MyPortfolioDistributionComponent implements OnInit {

  container: any = {};
  state$: any;
  media: any = [];

  constructor(
    public appContext: ApplicationContextService,
    private http: HttpClient,
    private aRoute: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.state$ = this.aRoute.paramMap
    .subscribe((param: any) => {
      this.getAssets({currency: param.get('currency')})
    })
  }

  getAssets(param: any) {
    this.container['assetsLoading'] = true;
    this.http.get(`${environment.baseApiUrl}/transactions/reports/value-by-asset?${param.currency? "currency="+param.currency:''}`)
    .subscribe(
      (valueByAsset) => {
        this.container['assetsLoading'] = false;
        this.container['valueByAsset']  = (valueByAsset as {data: any})?.data;
        this.container['totValInAsset'] = (this.container['valueByAsset'] as []).reduce((asset, {total}) => asset + total, 0)
        this.media = this.container['valueByAsset']?.TxnHeader?.Right?.Media?.filter((item: any) => {
          return item?.type?.name === 'logo'
        });
      },
      (errResp) => {
        this.container['assetsLoading'] = false;
      }
    );
  }
  getCurrencyDetails(currency: string) {
    return this.appContext.currencies.find(c=>c.code == currency);
  }

  returnImage(image) {
    this.media = image?.filter((item: any) => {
       return item?.type?.name === 'logo'
     });
     return this.media[0]?.response;
   }

}
