import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { SnackBarComponent } from '@app/_shared/components/snack-bar/snack-bar.component';
import { BvnKycComponent } from '@app/_shared/dialogs/bvn-kyc/bvn-kyc.component';
import { GatewayComponent } from '@app/_shared/dialogs/gateway/gateway.component';
import { RightGatewayComponent } from '@app/_shared/dialogs/right-gateway/right-gateway.component';
import { ValidateAccountComponent } from '@app/_shared/dialogs/validate-account/validate-account.component';
import { ValidateChnCscsOfferComponent } from '@app/_shared/dialogs/validate-chn-cscs-offer/validate-chn-cscs-offer.component';
import { Assets } from '@app/_shared/models/assets-model';
import { User } from '@app/_shared/models/user-model';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { environment } from '@environments/environment';
import {
  ApexAxisChartSeries,
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexPlotOptions,
  ApexYAxis,
  ApexLegend,
  ApexStroke,
  ApexXAxis,
  ApexFill,
  ApexTooltip,
  ApexGrid,
} from 'ng-apexcharts';
import { take } from 'rxjs';

export type ChartOptions = {
  series: ApexAxisChartSeries | any;
  chart: ApexChart | any;
  dataLabels: ApexDataLabels | any;
  plotOptions: ApexPlotOptions | any;
  yaxis: ApexYAxis | any;
  xaxis: ApexXAxis | any;
  fill: ApexFill | any;
  tooltip: ApexTooltip | any;
  stroke: ApexStroke | any;
  legend: ApexLegend | any;
  grid: ApexGrid | any;
  colors: any;
};

@Component({
  selector: 'app-offers-detail',
  templateUrl: './offers-detail.component.html',
  styleUrls: ['./offers-detail.component.scss'],
})
export class OffersDetailComponent implements OnInit {
  @ViewChild('chart') chart!: ChartComponent;
  public chartOptions!: Partial<ChartOptions>;
  id: any;
  container: any = {};
  userInformation!: User;
  asset!: Assets;
  rightLogo: any;
  assetBanner: any = [];
  userVerification: any;
  constructor(
    private _snackBar: MatSnackBar,
     public dialog: MatDialog,
     private activatedRoute: ActivatedRoute,
     public appContext: ApplicationContextService,
    private http: HttpClient

     ) {
    this.chartOptions = {
      series: [
        {
          name: 'Net Profit',
          data: [44, 55, 57, 56, 61, 58, 63, 60, 66, 30, 67, 90],
        },
        // {
        //   name: "Revenue",
        //   data: [76, 85, 101, 98, 87, 105, 91, 114, 94]
        // },
        // {
        //   name: "Free Cash Flow",
        //   data: [35, 41, 36, 26, 45, 48, 52, 53, 41]
        // }
      ],
      chart: {
        type: 'bar',
        height: 350,
        toolbar: {
          show: false,
        },
      },
      colors: ['#B4E1D1'],
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          // endingShape: "rounded"
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: false,
        width: 2,
        colors: ['transparent'],
      },
      xaxis: {
        categories: [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ],
      },
      yaxis: {
        show: false,
      },
      grid: {
        show: false,
      },
      fill: {
        opacity: 1,
      },
      tooltip: {
        y: {
          formatter: function (val: any) {
            return '$ ' + val + ' thousands';
          },
        },
      },
    };
  }

  openSnackBar(message: string) {
    this._snackBar.openFromComponent(SnackBarComponent, {
      duration: 2000,
      data: {
        message: message,
        icon: 'ri-checkbox-circle-fill',
      },
      panelClass: ['download'],
    });
  }

  ngOnInit() {
    this.container['assetsLoading'] = true;
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    this.appContext
    .getUserInformation()
    .subscribe({
      next: (data: User) => {
        this.userInformation = data;
        this.getAssets();
      },
    });
  }


  getAssets() {
    this.container['assetsLoading'] = true;
    this.http
      .get(`${environment.baseApiUrl}/assets/${this.id}`)
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          this.asset = response;
          this.rightLogo = this.asset?.extRef?.ngx.logo ?  this.asset?.extRef?.ngx.logo : '/assets/logo/po_logo.png';
          this.container['assetsLoading'] = false;
          this.assetBanner = this.asset?.Media?.filter((item: any) => {
            return item?.type?.name === 'banner'
          });
          const today = new Date();
          const closingDate = new Date(this.asset.closingDate);
          const openingDate = new Date(this.asset.openingDate);
          if (today > closingDate || openingDate > today) { this.asset.openForPurchase = false; }
          else { this.asset.openForPurchase = true; }
        },
        (errResp) => {
          this.container['assetsLoading'] = false;
        }
      );
  }

  checkEligibility() {
    const eligibilityDialog = this.dialog.open(ValidateChnCscsOfferComponent, {
      data: {
        offerId: this.asset?.id,
      },
      width: '40%',
      maxHeight: '600px',
      // height: '315px',
      disableClose: false,
      autoFocus: false,
    });

    eligibilityDialog.afterClosed().subscribe((result) => {
      if (result) {
        this.getUserVerification(result);
      } else {
        this.container['userLoading'] = false;
      }
    });
  }

  checkUserFromCHD() {
    this.container['userLoading'] = true;
    this.http
      .get(
        `${environment.baseApiUrl}/rights/checkRightStatus/${this.userInformation?.id}`
      )
      .subscribe(
        (res: any) => {
          if (res.isEligible) {
            this.checkCHNFromNgx(res);
          } else {
            this.checkEligibility();
          }
          // this.container['userLoading'] = false;
        },
        (errResp) => {
          this.container['userLoading'] = false;
        }
      );
  }


checkCHNFromNgx(resCHN: any) {
  this.http.get(`${environment.baseApiUrl}/3rd-party-services/ngx/brokers/lookup?id=${(resCHN?.data?.chn).toUpperCase()}&type=${'CHN'}`)
  .subscribe(
    (response: any) => {
      if(response?.data.data.isEligible) {
        if(response?.data?.data?.status === 'NEW' || response?.data?.data?.status === 'REQUEST_OVERAGE') {
          if(response?.data?.data?.cscs || response?.data?.data?.rin) {
            this.getUserVerification(response);
          } else {
            this.openSnackBar("We could not verify your CHN/CSCS. Please contact your stock broker for assistance");
          }

        } else if(response?.data?.data.status === 'REQUEST_TRADE') {
          this.container['userLoading'] = false;
          this.openSnackBar("You already purchased partial rights and renounced remaining rights. To purchase additional shares, contact your stockbroker");
        }
      } else {
        this.container['userLoading'] = false;
        if(response?.data?.data.cscs || response?.data?.data.rin) {
          this.openSnackBar("Looks like you have already participated in the Rights Issue! Please contact your broker for any additional information you may need.");
        } else {
          this.openSnackBar("You are not eligible to buy this rights issue, please contact your stockbroker");
        }
      }
    },
    (errResp) => {
      this.container['userLoading'] = false;
      this.openSnackBar(errResp?.error?.error?.message);
    }
  );
}


  getUserVerification(assetInfo: any) {
    this.http
      .get(`${environment.baseApiUrl}/users/verification/kyc`)
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          this.userVerification = response?.data?.missing;
          if (
            this.userVerification?.bvn ||
            this.userVerification?.mothersMaidenName ||
            this.userVerification?.placeOfBirth ||
            this.userVerification?.nextOfKin ||
            this.userVerification?.bankAccount ||
            this.userVerification?.address   ||
            this.userVerification?.lga   ||
            this.userVerification?.nationality   ||
            this.userVerification?.state
          ) {
            this.openRequirementDialog(this.userVerification);
          } else {
            this.openGatewayDialog(assetInfo)
          }

        },
        (errResp) => {
          this.container['userLoading'] = false;
        }
      );
  }

  openRequirementDialog(userDetails): void {
    const requirementDialog = this.dialog.open(BvnKycComponent, {
      data: {userDetails, showLater: false},
      width: '60%',
      maxHeight: '600px',
      disableClose: true,
      autoFocus: false,
    });

    requirementDialog.afterClosed().subscribe((result) => {
      if (result) {
      }
      this.container['userLoading'] = false;
    });
  }



  openGatewayDialog(assetInfo?: any): void {
    const getUrl = window.location;
    const gatewayDialog = this.dialog.open(GatewayComponent, {
      data: {
        fundName: this.asset.name,
        assetName: this.asset.name,
        assetType: 'e-ipo',
        type: 'debit',
        currency: this.asset?.currency,
        id: this.id,
        sharePrice: this.asset?.sharePrice,
        unit: this.asset?.minPurchaseUnits,
        // module: 'invest',
        description: `New deposit for ${this.asset.name}`,
        postUrl: `${environment.baseApiUrl}/transactions/create`,
        orderBase: "VALUE",
        transType: "SUBSCRIPTION",
        redirectUrl:
        getUrl.protocol +
        '//' +
        getUrl.host +
        '/app/home/view',
        callbackParams: {
          module: 'assets',
          assetId: this.id,
          resident: null,
          tenor: null,
        },
        gatewayEndpoints: `${environment.baseApiUrl}/3rd-party-services/gateway?id=${this.id}&modules=assets`
      },

      width: '408px',
      height: '500px'
    });

    gatewayDialog.afterClosed().subscribe((result) => {
      if (result) {
      }
    });
  }
}
